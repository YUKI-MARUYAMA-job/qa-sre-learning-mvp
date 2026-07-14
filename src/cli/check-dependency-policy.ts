type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

const packageJsonPath = "package.json";
const lockfilePath = "bun.lock";

function collectDependencyVersions(packageJson: PackageJson): Array<{
  section: string;
  name: string;
  version: string;
}> {
  const sections = [
    ["dependencies", packageJson.dependencies],
    ["devDependencies", packageJson.devDependencies],
    ["optionalDependencies", packageJson.optionalDependencies]
  ] as const;

  return sections.flatMap(([section, dependencies]) =>
    Object.entries(dependencies ?? {}).map(([name, version]) => ({
      section,
      name,
      version
    }))
  );
}

try {
  const packageJson = (await Bun.file(packageJsonPath).json()) as PackageJson;
  const lockfile = Bun.file(lockfilePath);

  const issues: string[] = [];

  if (!(await lockfile.exists())) {
    issues.push(`${lockfilePath} is required for reproducible installs.`);
  }

  for (const dependency of collectDependencyVersions(packageJson)) {
    if (dependency.version === "latest") {
      issues.push(
        `${dependency.section}.${dependency.name} must not use "latest".`
      );
    }
  }

  if (issues.length > 0) {
    console.error("Dependency policy validation failed.");

    for (const issue of issues) {
      console.error(`- ${issue}`);
    }

    process.exit(1);
  }

  console.log("Dependency policy validation passed.");
} catch (error) {
  console.error(error);
  process.exit(1);
}

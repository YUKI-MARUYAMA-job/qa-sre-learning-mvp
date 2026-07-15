const productionUrl = process.env.PRODUCTION_URL;

const requiredPaths = [
  "/",
  "/quality-report.html",
  "/portfolio-readiness.html"
] as const;

const requiredHeaders = [
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
  "content-security-policy"
] as const;

const issues: string[] = [];

if (!productionUrl) {
  console.error("PRODUCTION_URL is required.");
  console.error("Example: PRODUCTION_URL=https://<project>.pages.dev bun run validate:deployment");
  process.exit(1);
}

function buildUrl(path: string): string {
  return new URL(path, productionUrl).toString();
}

for (const path of requiredPaths) {
  const url = buildUrl(path);
  const response = await fetch(url);

  if (!response.ok) {
    issues.push(`${url} returned ${response.status}.`);
    continue;
  }

  const body = await response.text();

  if (path === "/" && !body.includes("Static Report Site")) {
    issues.push(`${url} does not include expected index marker.`);
  }

  if (path === "/quality-report.html" && !body.includes("Quality Report")) {
    issues.push(`${url} does not include expected quality report marker.`);
  }

  if (
    path === "/portfolio-readiness.html" &&
    !body.includes("Portfolio Readiness")
  ) {
    issues.push(`${url} does not include expected readiness report marker.`);
  }
}

const headResponse = await fetch(buildUrl("/"), { method: "HEAD" });

for (const header of requiredHeaders) {
  if (!headResponse.headers.has(header)) {
    issues.push(`Missing required response header: ${header}`);
  }
}

if (issues.length > 0) {
  console.error("Deployment baseline check failed.");

  for (const issue of issues) {
    console.error(`- ${issue}`);
  }

  process.exit(1);
}

console.log(`Deployment baseline check passed: ${productionUrl}`);

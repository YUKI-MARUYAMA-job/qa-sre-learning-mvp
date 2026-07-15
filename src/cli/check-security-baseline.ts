const requiredHeaders = [
  "X-Frame-Options: DENY",
  "X-Content-Type-Options: nosniff",
  "Referrer-Policy: no-referrer",
  "Permissions-Policy:",
  "Content-Security-Policy:"
] as const;

const headersPath = "site/static/_headers";
const outputHeadersPath = "dist/site/_headers";

const issues: string[] = [];

async function fileExists(path: string): Promise<boolean> {
  return await Bun.file(path).exists();
}

if (!(await fileExists(headersPath))) {
  issues.push(`${headersPath} does not exist.`);
}

if (!(await fileExists(outputHeadersPath))) {
  issues.push(`${outputHeadersPath} does not exist. Run bun run site:build first.`);
}

if (await fileExists(headersPath)) {
  const sourceHeaders = await Bun.file(headersPath).text();

  for (const header of requiredHeaders) {
    if (!sourceHeaders.includes(header)) {
      issues.push(`${headersPath} is missing required header: ${header}`);
    }
  }

  if (!sourceHeaders.includes("frame-ancestors 'none'")) {
    issues.push("Content-Security-Policy should include frame-ancestors 'none'.");
  }

  if (!sourceHeaders.includes("script-src 'none'")) {
    issues.push("Content-Security-Policy should include script-src 'none' for this static no-JS site.");
  }

  if (!sourceHeaders.includes("object-src 'none'")) {
    issues.push("Content-Security-Policy should include object-src 'none'.");
  }
}

if (issues.length > 0) {
  console.error("Security baseline check failed.");

  for (const issue of issues) {
    console.error(`- ${issue}`);
  }

  process.exit(1);
}

console.log("Security baseline check passed.");

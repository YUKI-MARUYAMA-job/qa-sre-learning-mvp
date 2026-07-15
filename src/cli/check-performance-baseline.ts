type FileBudget = {
  path: string;
  maxBytes: number;
};

const requiredFiles = [
  "dist/site/index.html",
  "dist/site/quality-report.html",
  "dist/site/portfolio-readiness.html",
  "dist/site/styles.css",
  "dist/site/_headers"
] as const;

const fileBudgets: FileBudget[] = [
  { path: "dist/site/index.html", maxBytes: 100_000 },
  { path: "dist/site/quality-report.html", maxBytes: 300_000 },
  { path: "dist/site/portfolio-readiness.html", maxBytes: 300_000 },
  { path: "dist/site/styles.css", maxBytes: 50_000 }
];

const totalBudgetBytes = 1_000_000;

const issues: string[] = [];

async function getFileSize(path: string): Promise<number | null> {
  const file = Bun.file(path);

  if (!(await file.exists())) {
    return null;
  }

  return file.size;
}

let totalBytes = 0;

for (const path of requiredFiles) {
  const size = await getFileSize(path);

  if (size === null) {
    issues.push(`Required file does not exist: ${path}`);
    continue;
  }

  totalBytes += size;
}

for (const budget of fileBudgets) {
  const size = await getFileSize(budget.path);

  if (size === null) {
    continue;
  }

  if (size > budget.maxBytes) {
    issues.push(
      `${budget.path} exceeds budget: ${size} bytes > ${budget.maxBytes} bytes`
    );
  }
}

if (totalBytes > totalBudgetBytes) {
  issues.push(
    `dist/site total size exceeds budget: ${totalBytes} bytes > ${totalBudgetBytes} bytes`
  );
}

if (issues.length > 0) {
  console.error("Performance baseline check failed.");

  for (const issue of issues) {
    console.error(`- ${issue}`);
  }

  process.exit(1);
}

console.log(`Performance baseline check passed. Total size: ${totalBytes} bytes.`);

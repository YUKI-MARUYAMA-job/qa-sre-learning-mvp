const outputDir = "dist/site";

const pages = [
  {
    title: "Quality Report",
    sourcePath: "reports/quality-report.md",
    outputPath: `${outputDir}/quality-report.html`
  },
  {
    title: "Portfolio Readiness Report",
    sourcePath: "reports/portfolio-readiness.md",
    outputPath: `${outputDir}/portfolio-readiness.html`
  }
] as const;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderInlineMarkdown(value: string): string {
  return escapeHtml(value).replace(/`([^`]+)`/g, "<code>$1</code>");
}

function renderMarkdown(markdown: string): string {
  const lines = markdown.split("\n");
  const html: string[] = [];
  let inCodeBlock = false;
  let inList = false;
  let inTable = false;
  let codeLines: string[] = [];

  function closeList(): void {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  }

  function closeTable(): void {
    if (inTable) {
      html.push("</tbody>");
      html.push("</table>");
      inTable = false;
    }
  }

  function renderTableRow(line: string, tag: "th" | "td"): string {
    const cells = line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => `<${tag}>${renderInlineMarkdown(cell.trim())}</${tag}>`)
      .join("");

    return `<tr>${cells}</tr>`;
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const nextLine = lines[index + 1] ?? "";

    if (line.startsWith("```")) {
      closeList();
      closeTable();

      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLines = [];
      } else {
        html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        inCodeBlock = false;
      }

      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (line.trim() === "") {
      closeList();
      closeTable();
      continue;
    }

    if (line.startsWith("# ")) {
      closeList();
      closeTable();
      html.push(`<h1>${renderInlineMarkdown(line.slice(2))}</h1>`);
      continue;
    }

    if (line.startsWith("## ")) {
      closeList();
      closeTable();
      html.push(`<h2>${renderInlineMarkdown(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith("### ")) {
      closeList();
      closeTable();
      html.push(`<h3>${renderInlineMarkdown(line.slice(4))}</h3>`);
      continue;
    }

    if (/^\|.+\|$/.test(line) && /^\|[-:\s|]+$/.test(nextLine)) {
      closeList();
      closeTable();
      html.push("<table>");
      html.push("<thead>");
      html.push(renderTableRow(line, "th"));
      html.push("</thead>");
      html.push("<tbody>");
      inTable = true;
      index += 1;
      continue;
    }

    if (inTable && /^\|.+\|$/.test(line)) {
      html.push(renderTableRow(line, "td"));
      continue;
    }

    if (line.startsWith("- ")) {
      closeTable();

      if (!inList) {
        html.push("<ul>");
        inList = true;
      }

      html.push(`<li>${renderInlineMarkdown(line.slice(2))}</li>`);
      continue;
    }

    closeList();
    closeTable();
    html.push(`<p>${renderInlineMarkdown(line)}</p>`);
  }

  closeList();
  closeTable();

  if (inCodeBlock) {
    html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  }

  return html.join("\n");
}

function renderPage(title: string, body: string): string {
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | qa-sre-learning-mvp</title>
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <header>
    <p class="report-meta">qa-sre-learning-mvp</p>
    <h1>${escapeHtml(title)}</h1>
    <nav>
      <ul>
        <li><a href="./index.html">Home</a></li>
        <li><a href="./quality-report.html">Quality Report</a></li>
        <li><a href="./portfolio-readiness.html">Portfolio Readiness Report</a></li>
      </ul>
    </nav>
  </header>
  <main>
${body}
  </main>
  <footer>
    <p>Generated from repository reports.</p>
  </footer>
</body>
</html>
`;
}

function renderIndex(): string {
  return renderPage(
    "Static Report Site",
    `<h2>Reports</h2>
<p>This site publishes generated portfolio reports for <code>qa-sre-learning-mvp</code>.</p>
<ul>
  <li><a href="./quality-report.html">Quality Report</a></li>
  <li><a href="./portfolio-readiness.html">Portfolio Readiness Report</a></li>
</ul>
<h2>Purpose</h2>
<p>This static site makes the QA/SRE quality pipeline visible outside the repository.</p>`
  );
}

await Bun.$`rm -rf ${outputDir}`;
await Bun.$`mkdir -p ${outputDir}`;

await Bun.write(`${outputDir}/styles.css`, await Bun.file("site/static/styles.css").text());
await Bun.write(`${outputDir}/_headers`, await Bun.file("site/static/_headers").text());
await Bun.write(`${outputDir}/index.html`, renderIndex());

for (const page of pages) {
  const markdown = await Bun.file(page.sourcePath).text();
  await Bun.write(page.outputPath, renderPage(page.title, renderMarkdown(markdown)));
}

console.log(`Static site generated: ${outputDir}`);

export async function readJsonFile(path: string): Promise<unknown> {
  const file = Bun.file(path);

  if (!(await file.exists())) {
    throw new Error(`File not found: ${path}`);
  }

  return await file.json();
}

export const buildXmlReport = (
  rootTag: string,
  itemTag: string,
  rows: Record<string, unknown>[]
): string => {
  const escape = (value: unknown): string =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const items = rows
    .map((row) => {
      const fields = Object.entries(row)
        .map(([key, value]) => `    <${key}>${escape(value)}</${key}>`)
        .join('\n');
      return `  <${itemTag}>\n${fields}\n  </${itemTag}>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootTag}>\n${items}\n</${rootTag}>\n`;
};

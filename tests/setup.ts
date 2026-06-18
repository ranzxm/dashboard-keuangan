import { readFileSync } from "node:fs";

const lines = readFileSync(".env.local", "utf8").split(/\r?\n/);

for (const line of lines) {
  const trimmedLine = line.trim();

  if (trimmedLine === "" || trimmedLine.startsWith("#")) {
    continue;
  }

  const separatorIndex = trimmedLine.indexOf("=");

  if (separatorIndex < 1) {
    throw new SyntaxError(`Baris environment tidak valid: "${trimmedLine}".`);
  }

  const key = trimmedLine.slice(0, separatorIndex);
  const value = trimmedLine.slice(separatorIndex + 1);
  process.env[key] = value;
}

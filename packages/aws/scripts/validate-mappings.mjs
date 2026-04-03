import fs from "node:fs";
import path from "node:path";

const packageRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const manifestPath = path.join(packageRoot, "generated", "aws-icon-manifest.json");
const mappingsPath = path.join(packageRoot, "mappings", "terraform-aws-icons.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function formatIconKey(value) {
  if (typeof value === "string") return value;
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  return JSON.stringify(value);
}

function main() {
  const manifest = readJson(manifestPath);
  const mappings = readJson(mappingsPath);

  const manifestIcons = manifest?.icons ?? {};
  const manifestCount = Object.keys(manifestIcons).length;

  const mappingEntries = Object.entries(mappings ?? {});
  const mappingCount = mappingEntries.length;

  const invalid = [];
  let validCount = 0;

  for (const [resourceName, iconKey] of mappingEntries) {
    const isValid = typeof iconKey === "string" && iconKey in manifestIcons;

    if (isValid) {
      validCount += 1;
      continue;
    }

    invalid.push({ resourceName, iconKey });
  }

  console.log(`Manifest icons: ${manifestCount}`);
  console.log(`Terraform mappings: ${mappingCount}`);
  console.log(`Valid mappings: ${validCount}`);
  console.log(`Invalid mappings: ${invalid.length}`);

  if (invalid.length > 0) {
    const sortedInvalid = invalid.sort((a, b) =>
      a.resourceName.localeCompare(b.resourceName)
    );

    console.log("Invalid mappings (missing icon key):");
    for (const entry of sortedInvalid) {
      console.log(`- ${entry.resourceName}: ${formatIconKey(entry.iconKey)}`);
    }

    process.exitCode = 1;
  }
}

main();

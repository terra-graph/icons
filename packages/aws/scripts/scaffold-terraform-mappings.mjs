import fs from "node:fs";
import path from "node:path";

const packageRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const outputPath = path.join(
  packageRoot,
  "generated",
  "terraform-aws-icons.scaffold.json"
);

const candidatePaths = [
  path.join(packageRoot, "generated", "terraform-aws-resource-names.json"),
  path.join(packageRoot, "generated", "terraform-aws-resources.json"),
  path.join(packageRoot, "mappings", "terraform-aws-resource-names.json"),
  path.join(packageRoot, "mappings", "terraform-aws-resources.json")
];

const fallbackResources = [
  "aws_lambda_function",
  "aws_s3_bucket",
  "aws_dynamodb_table",
  "aws_vpc",
  "aws_iam_role"
];

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function extractResources(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.resources)) return data.resources;
  return null;
}

function uniqueStrings(values) {
  const seen = new Set();
  const result = [];

  for (const value of values) {
    if (typeof value !== "string") continue;
    if (seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }

  return result;
}

function main() {
  let resources = null;
  let sourcePath = null;

  for (const candidate of candidatePaths) {
    if (!fs.existsSync(candidate)) continue;

    const data = readJson(candidate);
    const extracted = extractResources(data);

    if (extracted && extracted.length > 0) {
      resources = extracted;
      sourcePath = candidate;
      break;
    }
  }

  if (!resources) {
    resources = fallbackResources;
  }

  const uniqueResources = uniqueStrings(resources);

  if (uniqueResources.length === 0) {
    throw new Error("No Terraform resource names available to scaffold.");
  }

  const scaffold = {};
  for (const resourceName of uniqueResources) {
    scaffold[resourceName] = null;
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(scaffold, null, 2) + "\n", "utf8");

  if (sourcePath) {
    console.log(`Scaffolded ${uniqueResources.length} resources from ${sourcePath}`);
  } else {
    console.log(`Scaffolded ${uniqueResources.length} resources from fallback list`);
  }
  console.log(`Wrote ${outputPath}`);
}

main();

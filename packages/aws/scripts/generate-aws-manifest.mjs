import fs from 'node:fs';
import path from 'node:path';

const packageRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const vendorRoot = path.join(packageRoot, 'vendor', 'aws');
const outputPath = path.join(packageRoot, 'generated', 'aws-icon-manifest.json');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (entry.isFile() && (entry.name.endsWith('.svg') || entry.name.endsWith('.png'))) {
      files.push(fullPath);
    }
  }

  return files;
}

function toPosix(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function filenameToLabel(filename) {
  return filename
    .replace(/\.(svg|png)$/i, '')
    .replace(/^Arch_/, '')
    .replace(/^Res_/, '')
    .replace(/_(16|32|48|64|128)$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim();
}

function filenameToKey(filename) {
  return filename
    .replace(/\.(svg|png)$/i, '')
    .replace(/^Arch_/, '')
    .replace(/^Res_/, '')
    .replace(/_(16|32|48|64|128)$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function chooseBetterIcon(existingPath, candidatePath) {
  if (!existingPath) return candidatePath;

  const existingScore = scorePath(existingPath);
  const candidateScore = scorePath(candidatePath);

  return candidateScore > existingScore ? candidatePath : existingPath;
}

function scorePath(filePath) {
  let score = 0;

  if (/(^|\/)64(\/|$)|_64\.svg$/i.test(filePath)) score += 100;
  else if (/(^|\/)48(\/|$)|_48\.svg$/i.test(filePath)) score += 80;
  else if (/(^|\/)32(\/|$)|_32\.svg$/i.test(filePath)) score += 60;
  else if (/(^|\/)16(\/|$)|_16\.svg$/i.test(filePath)) score += 40;

  if (/arch/i.test(filePath)) score += 10;
  if (/resource/i.test(filePath)) score += 5;

  return score;
}

function main() {
  if (!fs.existsSync(vendorRoot)) {
    throw new Error(`Vendor directory not found: ${vendorRoot}`);
  }

  const iconFiles = walk(vendorRoot);
  const icons = {};

  for (const absolutePath of iconFiles) {
    const relativePath = toPosix(path.relative(packageRoot, absolutePath));
    const filename = path.basename(absolutePath);
    const ext = path.extname(filename).toLowerCase();
    const format = ext === '.svg' ? 'svg' : ext === '.png' ? 'png' : null;
    if (!format) continue;
    const key = filenameToKey(filename);
    const label = filenameToLabel(filename);

    if (!key) continue;

    const existing = icons[key] || { key, label, formats: {} };
    if (!existing.label) {
      existing.label = label;
    }

    const formats = existing.formats || {};
    const existingEntry = formats[format];
    const existingPath = existingEntry ? existingEntry.path : undefined;
    const chosenPath = chooseBetterIcon(existingPath, relativePath);

    formats[format] = {
      path: chosenPath,
      filename: path.basename(chosenPath),
    };

    existing.formats = formats;
    icons[key] = existing;
  }

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  fs.writeFileSync(outputPath, `${JSON.stringify({ icons }, null, 2)}\n`, 'utf8');

  console.log(`Scanned ${iconFiles.length} icon files`);
  console.log(`Wrote ${Object.keys(icons).length} icon entries to ${outputPath}`);
}

main();

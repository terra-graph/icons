import awsIconManifest from '../generated/aws-icon-manifest.json';
import terraformAwsIconMappings from '../mappings/terraform-aws-icons.json';
import type {
  AwsIconFormat,
  AwsIconManifest,
  AwsIconManifestEntry,
  AwsIconManifestFormatEntry,
} from './types.js';

const manifest = awsIconManifest as AwsIconManifest;
const mappings = terraformAwsIconMappings as Record<string, string>;

function toModuleRelativePath(iconPath: string): string {
  if (iconPath.startsWith('/') || iconPath.startsWith('./') || iconPath.startsWith('../')) {
    return iconPath;
  }

  return `../${iconPath}`;
}

function toBrowserUrl(iconPath: string): string {
  return new URL(toModuleRelativePath(iconPath), import.meta.url).href;
}

function toFilePath(iconPath: string): string {
  const url = new URL(toModuleRelativePath(iconPath), import.meta.url);
  if (url.protocol !== 'file:') {
    throw new Error(`AwsIcon expected a file URL but received ${url.protocol}`);
  }

  const pathname = decodeURIComponent(url.pathname);
  return /^\/[A-Za-z]:/.test(pathname) ? pathname.slice(1) : pathname;
}

function isNodeRuntime(): boolean {
  return typeof process !== 'undefined' && typeof process.versions?.node === 'string';
}

export class AwsIcon {
  private constructor(private readonly entry: AwsIconManifestEntry) {}

  public static fromTerraformResource(terraformResourceName: string): AwsIcon | undefined {
    const iconKey = mappings[terraformResourceName];
    const iconEntry = iconKey ? manifest.icons[iconKey] : undefined;
    return iconEntry ? new AwsIcon(iconEntry) : undefined;
  }

  public static fromManifestKey(iconKey: string): AwsIcon | undefined {
    const iconEntry = manifest.icons[iconKey];
    return iconEntry ? new AwsIcon(iconEntry) : undefined;
  }

  public static fromEntry(entry: AwsIconManifestEntry): AwsIcon {
    return new AwsIcon(entry);
  }

  public get key(): string {
    return this.entry.key;
  }

  public get label(): string {
    return this.entry.label;
  }

  public hasFormat(format: AwsIconFormat): boolean {
    return Boolean(this.entry.formats?.[format]);
  }

  public path(format: AwsIconFormat): string {
    return this.getFormatEntry(format).path;
  }

  public filename(format: AwsIconFormat): string {
    return this.getFormatEntry(format).filename;
  }

  public url(format: AwsIconFormat): string {
    return toBrowserUrl(this.getFormatEntry(format).path);
  }

  public filePath(format: AwsIconFormat): string {
    if (!isNodeRuntime()) {
      throw new Error('AwsIcon.filePath is Node-only');
    }

    return toFilePath(this.getFormatEntry(format).path);
  }

  private getFormatEntry(format: AwsIconFormat): AwsIconManifestFormatEntry {
    const entry = this.entry.formats?.[format];
    if (!entry) {
      throw new Error(`AwsIcon missing ${format} format for ${this.entry.key}`);
    }

    return entry;
  }
}

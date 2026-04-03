import { fileURLToPath } from "node:url";
import awsIconManifest from "../generated/aws-icon-manifest.json";
import terraformAwsIconMappings from "../mappings/terraform-aws-icons.json";
import type { AwsIconManifest, AwsIconManifestEntry } from "./index.js";

const manifest = awsIconManifest as AwsIconManifest;
const mappings = terraformAwsIconMappings as Record<string, string>;

function toModuleRelativePath(iconPath: string): string {
  if (
    iconPath.startsWith("/") ||
    iconPath.startsWith("./") ||
    iconPath.startsWith("../")
  ) {
    return iconPath;
  }

  return `../${iconPath}`;
}

function toBrowserUrl(iconPath: string): string {
  return new URL(toModuleRelativePath(iconPath), import.meta.url).href;
}

function toFilePath(iconPath: string): string {
  return fileURLToPath(new URL(toModuleRelativePath(iconPath), import.meta.url));
}

function isNodeRuntime(): boolean {
  return (
    typeof process !== "undefined" &&
    typeof process.versions?.node === "string"
  );
}

export class AwsIcon {
  private constructor(private readonly entry: AwsIconManifestEntry) {}

  public static fromTerraformResource(
    terraformResourceName: string,
  ): AwsIcon | undefined {
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

  public get path(): string {
    return this.entry.path;
  }

  public get filename(): string {
    return this.entry.filename;
  }

  public url(): string {
    return toBrowserUrl(this.entry.path);
  }

  public filePath(): string {
    if (!isNodeRuntime()) {
      throw new Error("AwsIcon.filePath is Node-only");
    }

    return toFilePath(this.entry.path);
  }
}

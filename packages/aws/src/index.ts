import awsIconManifest from '../generated/aws-icon-manifest.json';
import terraformAwsIconMappings from '../mappings/terraform-aws-icons.json';
import { AwsIcon } from './AwsIcon.js';
export * from './plugins/AwsDotIconPlugin.js';
export * from './rules/index.js';
export * from './provider.js';

export interface AwsIconManifestEntry {
  key: string;
  label: string;
  path: string;
  filename: string;
}

export interface AwsIconManifest {
  icons: Record<string, AwsIconManifestEntry>;
}

const manifest = awsIconManifest as AwsIconManifest;
const mappings = terraformAwsIconMappings as Record<string, string>;

export function getAwsIconManifest(): AwsIconManifest {
  return manifest;
}

export { AwsIcon };

export const terraformAwsIconMap: Record<string, string> = Object.fromEntries(
  Object.entries(mappings)
    .map(([terraformResourceName, iconKey]) => {
      const icon = AwsIcon.fromManifestKey(iconKey);
      return icon ? [terraformResourceName, icon.url()] : null;
    })
    .filter((entry): entry is [string, string] => Array.isArray(entry)),
);

export const terraformAwsIconKeys: Record<string, string> = mappings;

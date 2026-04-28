import awsIconManifest from '../generated/aws-icon-manifest.json';
import terraformAwsIconMappings from '../mappings/terraform-aws-icons.json';
import { AwsIcon } from './AwsIcon.js';
import './rules/registerAll.js';
import provider from './provider.js';

export * from './plugins/AwsIconPlugin.js';
export * from './rules/index.js';
export { provider };
export const runtimeProvider = provider;
export default provider;

export interface AwsIconManifestEntry {
  key: string;
  label: string;
  formats: Partial<Record<AwsIconFormat, AwsIconManifestFormatEntry>>;
}

export interface AwsIconManifest {
  icons: Record<string, AwsIconManifestEntry>;
}

export type AwsIconFormat = 'svg' | 'png';

export interface AwsIconManifestFormatEntry {
  path: string;
  filename: string;
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
      return icon ? [terraformResourceName, icon.url('svg')] : null;
    })
    .filter((entry): entry is [string, string] => Array.isArray(entry)),
);

export const terraformAwsIconKeys: Record<string, string> = mappings;

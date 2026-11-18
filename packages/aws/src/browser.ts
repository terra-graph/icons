import awsIconManifest from '../generated/aws-icon-manifest.json';
import terraformAwsIconMappings from '../mappings/terraform-aws-icons.json';
import { AwsIcon } from './AwsIcon.js';

export type {
  AwsIconFormat,
  AwsIconManifest,
  AwsIconManifestEntry,
  AwsIconManifestFormatEntry,
} from './types.js';
export { AwsIcon };

const manifest = awsIconManifest;
const mappings = terraformAwsIconMappings as Record<string, string>;

export function getAwsIconManifest() {
  return manifest;
}

export const terraformAwsIconMap: Record<string, string> = Object.fromEntries(
  Object.entries(mappings)
    .map(([terraformResourceName, iconKey]) => {
      const icon = AwsIcon.fromManifestKey(iconKey);
      return icon ? [terraformResourceName, icon.url('svg')] : null;
    })
    .filter((entry): entry is [string, string] => Array.isArray(entry)),
);

export const terraformAwsIconKeys: Record<string, string> = mappings;

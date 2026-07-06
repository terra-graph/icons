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

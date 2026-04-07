import { AwsIcon } from './AwsIcon.js';
import { terraformAwsIconKeys } from './index.js';

describe('AwsIcon', () => {
  it('resolves icons by terraform resource name', () => {
    const resource = 'aws_lambda_function';
    const iconKey = terraformAwsIconKeys[resource];
    expect(iconKey).toBeDefined();

    const icon = AwsIcon.fromTerraformResource(resource);
    expect(icon?.key).toBe(iconKey);
  });

  it('returns undefined for unmapped terraform resources', () => {
    const icon = AwsIcon.fromTerraformResource('aws_missing_resource');
    expect(icon).toBeUndefined();
  });

  it('resolves icons by manifest key', () => {
    const resource = 'aws_lambda_function';
    const iconKey = terraformAwsIconKeys[resource];
    expect(iconKey).toBeDefined();

    const icon = AwsIcon.fromManifestKey(iconKey);
    expect(icon?.key).toBe(iconKey);
  });

  it('returns undefined for unknown manifest keys', () => {
    const icon = AwsIcon.fromManifestKey('missing-key');
    expect(icon).toBeUndefined();
  });

  it('wraps manifest entries directly', () => {
    const entry = {
      key: 'custom',
      label: 'Custom',
      path: '/abs/icon.svg',
      filename: 'icon.svg',
    };
    const icon = AwsIcon.fromEntry(entry);

    expect(icon.key).toBe(entry.key);
    expect(icon.label).toBe(entry.label);
    expect(icon.path).toBe(entry.path);
    expect(icon.filename).toBe(entry.filename);
    expect(icon.url()).toContain('/abs/icon.svg');
  });

  it('prefixes module-relative paths for urls', () => {
    const entry = {
      key: 'rel',
      label: 'Rel',
      path: 'vendor/aws/icon.svg',
      filename: 'icon.svg',
    };
    const icon = AwsIcon.fromEntry(entry);

    expect(icon.url()).toContain('/vendor/aws/icon.svg');
  });

  it('returns file paths in node runtimes', () => {
    const resource = 'aws_lambda_function';
    const icon = AwsIcon.fromTerraformResource(resource);
    expect(icon).toBeDefined();

    const filePath = icon?.filePath();
    expect(filePath).toContain('vendor');
    expect(filePath).toContain('aws');
  });

  it('throws when file paths are requested outside node', () => {
    const entry = {
      key: 'custom',
      label: 'Custom',
      path: 'vendor/aws/icon.svg',
      filename: 'icon.svg',
    };
    const icon = AwsIcon.fromEntry(entry);

    const original = Object.getOwnPropertyDescriptor(process.versions, 'node');
    Object.defineProperty(process.versions, 'node', {
      value: undefined,
      configurable: true,
    });

    try {
      expect(() => icon.filePath()).toThrow('AwsIcon.filePath is Node-only');
    } finally {
      if (original) {
        Object.defineProperty(process.versions, 'node', original);
      }
    }
  });
});

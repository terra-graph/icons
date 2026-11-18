import { jest } from '@jest/globals';
import { AwsIcon } from './AwsIcon.js';
import { terraformAwsIconKeys } from './browser.js';

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
      formats: {
        svg: {
          path: '/abs/icon.svg',
          filename: 'icon.svg',
        },
        png: {
          path: '/abs/icon.png',
          filename: 'icon.png',
        },
      },
    };
    const icon = AwsIcon.fromEntry(entry);

    expect(icon.key).toBe(entry.key);
    expect(icon.label).toBe(entry.label);
    expect(icon.path('svg')).toBe(entry.formats.svg.path);
    expect(icon.filename('png')).toBe(entry.formats.png.filename);
    expect(icon.url('svg')).toContain('/abs/icon.svg');
  });

  it('prefixes module-relative paths for urls', () => {
    const entry = {
      key: 'rel',
      label: 'Rel',
      formats: {
        svg: {
          path: 'vendor/aws/icon.svg',
          filename: 'icon.svg',
        },
      },
    };
    const icon = AwsIcon.fromEntry(entry);

    expect(icon.url('svg')).toContain('/vendor/aws/icon.svg');
  });

  it('returns file paths in node runtimes', () => {
    const resource = 'aws_lambda_function';
    const icon = AwsIcon.fromTerraformResource(resource);
    expect(icon).toBeDefined();

    const filePath = icon?.filePath('svg');
    expect(filePath).toContain('vendor');
    expect(filePath).toContain('aws');
  });

  it('throws when file paths are requested outside node', () => {
    const entry = {
      key: 'custom',
      label: 'Custom',
      formats: {
        svg: {
          path: 'vendor/aws/icon.svg',
          filename: 'icon.svg',
        },
      },
    };
    const icon = AwsIcon.fromEntry(entry);

    const original = Object.getOwnPropertyDescriptor(process.versions, 'node');
    Object.defineProperty(process.versions, 'node', {
      value: undefined,
      configurable: true,
    });

    try {
      expect(() => icon.filePath('svg')).toThrow('AwsIcon.filePath is Node-only');
    } finally {
      if (original) {
        Object.defineProperty(process.versions, 'node', original);
      }
    }
  });

  it('throws when the requested format is missing', () => {
    const entry = {
      key: 'custom',
      label: 'Custom',
      formats: {
        svg: {
          path: 'vendor/aws/icon.svg',
          filename: 'icon.svg',
        },
      },
    };
    const icon = AwsIcon.fromEntry(entry);

    expect(() => icon.url('png')).toThrow('AwsIcon missing png format for custom');
  });
});

describe('AwsIcon.url', () => {
  it.each(['./icons/test.svg', '../icons/test.svg'])(
    'shoud preserve an explicit relative path %s',
    (path) => {
      const icon = AwsIcon.fromEntry({
        key: 'relative',
        label: 'Relative',
        formats: { svg: { path, filename: 'test.svg' } },
      });
      expect(icon.url('svg')).toBe(
        new URL(path, import.meta.url.replace('AwsIcon.test.ts', 'AwsIcon.ts')).href,
      );
    },
  );
});

describe('AwsIcon.filePath', () => {
  it('shoud reject a URL that does not use the file protocol', () => {
    const icon = AwsIcon.fromManifestKey('aws-cloud');
    const spy = jest
      .spyOn(globalThis, 'URL')
      .mockImplementation(() => ({ protocol: 'https:', pathname: '/icon.svg' }) as URL);
    try {
      expect(() => icon?.filePath('svg')).toThrow(
        'AwsIcon expected a file URL but received https:',
      );
    } finally {
      spy.mockRestore();
    }
  });

  it('shoud normalize a Windows drive path', () => {
    const icon = AwsIcon.fromManifestKey('aws-cloud');
    const spy = jest
      .spyOn(globalThis, 'URL')
      .mockImplementation(() => ({ protocol: 'file:', pathname: '/C:/icons/test.svg' }) as URL);
    try {
      expect(icon?.filePath('svg')).toBe('C:/icons/test.svg');
    } finally {
      spy.mockRestore();
    }
  });

  it('shoud reject file access when process is absent', () => {
    const icon = AwsIcon.fromManifestKey('aws-cloud');
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'process');
    let failure: unknown;
    try {
      Object.defineProperty(globalThis, 'process', { value: undefined, configurable: true });
      try {
        icon?.filePath('svg');
      } catch (error) {
        failure = error;
      }
    } finally {
      if (descriptor) Object.defineProperty(globalThis, 'process', descriptor);
    }
    expect(failure).toEqual(new Error('AwsIcon.filePath is Node-only'));
  });
});

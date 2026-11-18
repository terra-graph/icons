import { jest } from '@jest/globals';
import manifest from '../generated/aws-icon-manifest.json';
import mappings from '../mappings/terraform-aws-icons.json';
import { AwsIcon } from './AwsIcon.js';

describe('getAwsIconManifest', () => {
  it('shoud expose the manifest and omit mappings whose icons are missing', async () => {
    const firstResource = Object.keys(mappings)[0];
    const spy = jest.spyOn(AwsIcon, 'fromManifestKey').mockReturnValueOnce(undefined);
    try {
      const browser = await import('./browser.js');
      expect(browser.getAwsIconManifest()).toEqual(manifest);
      expect(browser.terraformAwsIconKeys).toEqual(mappings);
      expect(browser.terraformAwsIconMap[firstResource]).toBeUndefined();
      const resource = Object.keys(mappings)[1];
      expect(browser.terraformAwsIconMap[resource]).toBe(
        AwsIcon.fromTerraformResource(resource)?.url('svg'),
      );
    } finally {
      spy.mockRestore();
    }
  });
});

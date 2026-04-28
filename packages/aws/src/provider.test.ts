import { GraphPluginRegistry } from '@terra-graph/core';
import { AWS_ICON_PLUGIN_NAME, AwsIconPlugin } from './plugins/AwsIconPlugin.js';
import provider from './provider.js';

describe('aws icons provider.', () => {
  it('should register the aws icon plugin', () => {
    const runtimeProvider = provider();
    expect(runtimeProvider.plugins).toBeInstanceOf(GraphPluginRegistry);

    const plugins = runtimeProvider.plugins?.names() ?? [];
    expect(plugins).toContain(AWS_ICON_PLUGIN_NAME);

    const resolved = runtimeProvider.plugins?.resolve(AWS_ICON_PLUGIN_NAME);
    expect(resolved).toBeInstanceOf(AwsIconPlugin);
  });
});

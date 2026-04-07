import { GraphPluginRegistry } from '@terra-graph/core';
import { AWS_DOT_ICON_PLUGIN_NAME, AwsDotIconPlugin } from './plugins/AwsDotIconPlugin.js';
import { provider } from './provider.js';

describe('aws icons provider', () => {
  it('registers the aws dot icon plugin', () => {
    const runtimeProvider = provider();
    expect(runtimeProvider.plugins).toBeInstanceOf(GraphPluginRegistry);

    const plugins = runtimeProvider.plugins?.names() ?? [];
    expect(plugins).toContain(AWS_DOT_ICON_PLUGIN_NAME);

    const resolved = runtimeProvider.plugins?.resolve(AWS_DOT_ICON_PLUGIN_NAME);
    expect(resolved).toBeInstanceOf(AwsDotIconPlugin);
  });
});

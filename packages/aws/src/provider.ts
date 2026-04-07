import { GraphPluginRegistry, type RuntimeProvider } from '@terra-graph/core';
import { AWS_DOT_ICON_PLUGIN_NAME, AwsDotIconPlugin } from './plugins/AwsDotIconPlugin';

export const provider = (): RuntimeProvider => ({
  plugins: new GraphPluginRegistry({
    [AWS_DOT_ICON_PLUGIN_NAME]: new AwsDotIconPlugin(),
  }),
});

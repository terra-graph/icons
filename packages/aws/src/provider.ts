import { GraphPluginRegistry, type RuntimeProvider } from '@terra-graph/core';
import { AWS_ICON_PLUGIN_NAME, AwsIconPlugin } from './plugins/AwsIconPlugin';

export default (): RuntimeProvider => ({
  plugins: new GraphPluginRegistry({
    [AWS_ICON_PLUGIN_NAME]: new AwsIconPlugin(),
  }),
});

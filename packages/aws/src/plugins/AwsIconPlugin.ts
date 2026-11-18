import {
  GraphPlugin,
  type GraphPluginBuildInput,
  type GraphPluginBuildResult,
} from '@terra-graph/core/Graph/GraphPlugin.js';
import { AwsIconRule, type IconRuleOptions } from '../rules/AwsIconRule.js';

export const AWS_ICON_PLUGIN_NAME = '@terra-graph/icons-aws:plugin';

export class AwsIconPlugin extends GraphPlugin<IconRuleOptions> {
  constructor() {
    super(AWS_ICON_PLUGIN_NAME);
  }

  public override build(input: GraphPluginBuildInput<IconRuleOptions>): GraphPluginBuildResult {
    return {
      phases: [
        {
          phase: 'pre',
          rules: [
            new AwsIconRule({
              node: { attr: { key: 'terraform.resource', startsWith: 'aws_' } },
              options: input.options ?? {},
            }),
          ],
        },
      ],
    };
  }
}

export const awsDotIconPlugin = new AwsIconPlugin();

import {
  GraphPlugin,
  type GraphPluginBuildInput,
  type GraphPluginBuildResult,
} from '@terra-graph/core/Graph/GraphPlugin.js';
import { AwsDotIconRule, type DotIconRuleOptions } from '../rules/AwsDotIconRule.js';

export const AWS_DOT_ICON_PLUGIN_NAME = '@terra-graph/icons-aws:plugin:dot';

export class AwsDotIconPlugin extends GraphPlugin<DotIconRuleOptions> {
  constructor() {
    super(AWS_DOT_ICON_PLUGIN_NAME);
  }

  public override build(input: GraphPluginBuildInput<DotIconRuleOptions>): GraphPluginBuildResult {
    return {
      phases: [{ phase: 'main', rules: [new AwsDotIconRule(input.options)] }],
    };
  }
}

export const awsDotIconPlugin = new AwsDotIconPlugin();

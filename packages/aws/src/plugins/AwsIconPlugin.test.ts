import { DotAdapter, type NodeId, type TgGraph, tgNodeIdFrom } from '@terra-graph/core';
import { AwsIcon } from '../AwsIcon.js';
import { AwsIconRule, type DotNodeOptions } from '../rules/AwsIconRule.js';
import { AwsIconPlugin } from './AwsIconPlugin.js';

const makeGraph = (resource: string): { graph: TgGraph; nodeId: NodeId } => {
  const nodeId = tgNodeIdFrom('resource', `${resource}.example`);
  const graph: TgGraph = {
    schemaVersion: '1.0.0',
    nodes: {
      [nodeId]: {
        id: nodeId,
        terraform: {
          resource,
        },
      },
    },
    edges: [],
    description: {},
  };

  return { graph, nodeId };
};

describe('AwsDotIconPlugin', () => {
  it('builds semantics phase with the icon rule', () => {
    const plugin = new AwsIconPlugin();
    const dotOverrides: DotNodeOptions = {
      shape: 'box',
      imagescale: true,
      labelloc: 'b',
      height: 1.6,
      width: 1.2,
      fixedsize: true,
      imagepos: 'tc',
    };

    const result = plugin.build({
      options: { imageMode: 'filePath', dot: dotOverrides },
      namedRules: undefined as unknown as never,
      namedRuleSets: undefined as unknown as never,
    });

    expect(result.phases?.length).toBe(1);
    expect(result.phases?.[0]?.phase).toBe('main');

    const rule = result.phases?.[0]?.rules?.[0] as AwsIconRule | undefined;
    expect(rule).toBeInstanceOf(AwsIconRule);

    const { graph, nodeId } = makeGraph('aws_lambda_function');
    const adapter = new DotAdapter().withTgGraph(graph);
    const node = adapter.getNodeAttributes(nodeId);
    if (!node || !rule) {
      throw new Error('missing test node or rule');
    }

    expect(rule.match(nodeId, node, adapter)).toBe(true);
    const updated = rule.apply(nodeId, node, adapter) as DotAdapter;
    const updatedNode = updated.getNodeAttributes(nodeId);
    if (!updatedNode) {
      throw new Error('missing updated node');
    }

    const icon = AwsIcon.fromTerraformResource('aws_lambda_function');
    expect(icon).toBeDefined();

    const dotAttrs = updatedNode.adapter?.[DotAdapter.name] as Record<string, unknown>;
    expect(dotAttrs.image).toBe(icon?.filePath('svg'));
    expect(dotAttrs.shape).toBe('box');
  });

  it('defaults plugin options to an empty object', () => {
    const plugin = new AwsIconPlugin();
    const result = plugin.build({
      options: undefined as unknown as never,
      namedRules: undefined as unknown as never,
      namedRuleSets: undefined as unknown as never,
    });

    const rule = result.phases?.[0]?.rules?.[0] as AwsIconRule | undefined;
    if (!rule) {
      throw new Error('missing rule');
    }

    const serialized = rule.serialize();
    expect(serialized.config.options).toEqual({});
  });

  it('applies fallback icon for unmapped aws resources with default options', () => {
    const plugin = new AwsIconPlugin();
    const result = plugin.build({
      options: undefined as unknown as never,
      namedRules: undefined as unknown as never,
      namedRuleSets: undefined as unknown as never,
    });

    const rule = result.phases?.[0]?.rules?.[0] as AwsIconRule | undefined;
    if (!rule) {
      throw new Error('missing rule');
    }

    const { graph, nodeId } = makeGraph('aws_missing_resource');
    const adapter = new DotAdapter().withTgGraph(graph);
    const node = adapter.getNodeAttributes(nodeId);
    if (!node) {
      throw new Error('missing node');
    }

    expect(rule.match(nodeId, node, adapter)).toBe(true);
    const updated = rule.apply(nodeId, node, adapter) as DotAdapter;
    const updatedNode = updated.getNodeAttributes(nodeId);
    if (!updatedNode) {
      throw new Error('missing updated node');
    }

    const fallback = AwsIcon.fromManifestKey('aws-cloud');
    expect(fallback).toBeDefined();

    const dotAttrs = updatedNode.adapter?.[DotAdapter.name] as Record<string, unknown>;
    expect(dotAttrs.image).toBe(fallback?.filePath('svg'));
    expect(dotAttrs.shape).toBe('plaintext');
  });
});

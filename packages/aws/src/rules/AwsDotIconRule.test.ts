import {
  DotAdapter,
  GraphologyAdapter,
  type NodeId,
  type TgGraph,
  tgNodeIdFrom,
} from '@terra-graph/core';
import { AwsIcon } from '../AwsIcon.js';
import { AwsDotIconRule, type DotNodeOptions } from './AwsDotIconRule.js';

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

describe('AwsDotIconRule', () => {
  it('only supports DotAdapter', () => {
    const rule = new AwsDotIconRule();
    expect(rule.supports(new DotAdapter())).toBe(true);
    expect(rule.supports(new GraphologyAdapter())).toBe(false);
  });

  it('skips nodes that were not matched', () => {
    const rule = new AwsDotIconRule();
    const { graph, nodeId } = makeGraph('aws_lambda_function');
    const adapter = new DotAdapter().withTgGraph(graph);
    const node = adapter.getNodeAttributes(nodeId);
    if (!node) {
      throw new Error('missing node');
    }

    const updated = rule.apply(nodeId, node, adapter);
    expect(updated).toBe(adapter);
  });

  it('skips nodes that do not match the aws resource query', () => {
    const rule = new AwsDotIconRule();
    const { graph, nodeId } = makeGraph('google_storage_bucket');
    const adapter = new DotAdapter().withTgGraph(graph);
    const node = adapter.getNodeAttributes(nodeId);
    if (!node) {
      throw new Error('missing node');
    }

    expect(rule.match(nodeId, node, adapter)).toBe(false);
    const updated = rule.apply(nodeId, node, adapter);
    expect(updated).toBe(adapter);
  });

  it('skips when no icon mapping exists', () => {
    const rule = new AwsDotIconRule();
    const { graph, nodeId } = makeGraph('aws_missing_resource');
    const adapter = new DotAdapter().withTgGraph(graph);
    const node = adapter.getNodeAttributes(nodeId);
    if (!node) {
      throw new Error('missing node');
    }

    expect(rule.match(nodeId, node, adapter)).toBe(true);
    const updated = rule.apply(nodeId, node, adapter);
    expect(updated).toBe(adapter);
  });

  it('applies dot image attributes for mapped resources', () => {
    const rule = new AwsDotIconRule();
    const { graph, nodeId } = makeGraph('aws_lambda_function');
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

    const icon = AwsIcon.fromTerraformResource('aws_lambda_function');
    expect(icon).toBeDefined();

    const dotAttrs = updatedNode.adapter?.[DotAdapter.name] as Record<string, unknown>;
    expect(dotAttrs.image).toBe(icon?.url());
    expect(dotAttrs.shape).toBe('plaintext');
  });

  it('uses file paths and custom dot overrides when configured', () => {
    const dotOverrides: DotNodeOptions = {
      shape: 'box',
      imagescale: true,
      labelloc: 'b',
      height: 1.6,
      width: 1.2,
      fixedsixe: true,
      imagepos: 'tc',
    };
    const rule = new AwsDotIconRule({ imageMode: 'filePath', dot: dotOverrides });
    const { graph, nodeId } = makeGraph('aws_lambda_function');
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

    const icon = AwsIcon.fromTerraformResource('aws_lambda_function');
    expect(icon).toBeDefined();

    const dotAttrs = updatedNode.adapter?.[DotAdapter.name] as Record<string, unknown>;
    expect(dotAttrs.image).toBe(icon?.filePath());
    expect(dotAttrs.shape).toBe('box');
  });

  it('returns early if a matched node loses terraform data', () => {
    const rule = new AwsDotIconRule();
    const { graph, nodeId } = makeGraph('aws_lambda_function');
    const adapter = new DotAdapter().withTgGraph(graph);
    const node = adapter.getNodeAttributes(nodeId);
    if (!node) {
      throw new Error('missing node');
    }

    expect(rule.match(nodeId, node, adapter)).toBe(true);
    const updated = rule.apply(nodeId, {}, adapter);
    expect(updated).toBe(adapter);
  });

  it('returns early if terraform resource is not a string', () => {
    const rule = new AwsDotIconRule();
    const { graph, nodeId } = makeGraph('aws_lambda_function');
    const adapter = new DotAdapter().withTgGraph(graph);
    const node = adapter.getNodeAttributes(nodeId);
    if (!node) {
      throw new Error('missing node');
    }

    expect(rule.match(nodeId, node, adapter)).toBe(true);
    const updated = rule.apply(
      nodeId,
      { terraform: { resource: 42 } } as unknown as Record<string, unknown>,
      adapter,
    );
    expect(updated).toBe(adapter);
  });
});

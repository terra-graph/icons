import { fileURLToPath } from 'node:url';
import { jest } from '@jest/globals';
import {
  DotAdapter,
  GraphologyAdapter,
  type NodeId,
  type TgGraph,
  tgNodeIdFrom,
} from '@terra-graph/core';
import { BaseRule } from '@terra-graph/core/Graph/Rules/Rule.js';
import { AwsIcon } from '../AwsIcon.js';
import { AwsIconRule, type IconRuleOptions } from './AwsIconRule.js';

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

const makeRule = (options: IconRuleOptions = {}): AwsIconRule =>
  new AwsIconRule({
    node: { attr: { key: 'terraform.resource', startsWith: 'aws_' } },
    options,
  });

describe('AwsIconRule.apply', () => {
  it('supports both graph adapters', () => {
    const rule = makeRule();
    expect(rule.supports(new DotAdapter())).toBe(true);
    expect(rule.supports(new GraphologyAdapter())).toBe(true);
  });

  it('skips nodes that were not matched', () => {
    const rule = makeRule();
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
    const rule = makeRule();
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

  it('applies fallback icon when no icon mapping exists', () => {
    const rule = makeRule();
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

    const icon = AwsIcon.fromManifestKey('aws-cloud');
    expect(icon).toBeDefined();

    const layout = updatedNode.hints?.layout;
    expect(layout?.image).toBe(icon?.filePath('svg'));
  });

  it('applies layout image hints for mapped resources', () => {
    const rule = makeRule();
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

    const layout = updatedNode.hints?.layout;
    expect(layout?.image).toBe(icon?.filePath('svg'));
  });

  it('preserves existing hints and adapter attributes when adding an image', () => {
    const rule = makeRule({ imageMode: 'filePath' });
    const { graph, nodeId } = makeGraph('aws_lambda_function');
    graph.nodes[nodeId].hints = { layout: { text1: 'Worker' } };
    graph.nodes[nodeId].adapter = { [DotAdapter.name]: { shape: 'box' } };
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

    const layout = updatedNode.hints?.layout;
    expect(layout?.image).toBe(icon?.filePath('svg'));
    expect(layout?.text1).toBe('Worker');
    expect(updatedNode.adapter).toEqual({ [DotAdapter.name]: { shape: 'box' } });
  });

  it('uses url images when imageMode is url', () => {
    const rule = makeRule({ imageMode: 'url' });
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

    const layout = updatedNode.hints?.layout;
    expect(layout?.image).toBe(icon?.url('svg'));
  });

  it('uses fallback url images when imageMode is url and mapping is missing', () => {
    const rule = makeRule({ imageMode: 'url' });
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

    const icon = AwsIcon.fromManifestKey('aws-cloud');
    expect(icon).toBeDefined();

    const layout = updatedNode.hints?.layout;
    expect(layout?.image).toBe(icon?.url('svg'));
  });

  it('uses png images when imageFormat is png', () => {
    const rule = makeRule({ imageFormat: 'png' });
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

    const layout = updatedNode.hints?.layout;
    expect(layout?.image).toBe(icon?.filePath('png'));
  });

  it('uses fallback png images when imageFormat is png and mapping is missing', () => {
    const rule = makeRule({ imageFormat: 'png' });
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

    const icon = AwsIcon.fromManifestKey('aws-cloud');
    expect(icon).toBeDefined();

    const layout = updatedNode.hints?.layout;
    expect(layout?.image).toBe(icon?.filePath('png'));
  });

  it('preserves options when serialized and rehydrated', () => {
    const rule = makeRule({ imageFormat: 'png' });
    const serialized = rule.serialize();
    const restored = BaseRule.fromSerialized(serialized) as AwsIconRule;

    const { graph, nodeId } = makeGraph('aws_lambda_function');
    const adapter = new DotAdapter().withTgGraph(graph);
    const node = adapter.getNodeAttributes(nodeId);
    if (!node) {
      throw new Error('missing node');
    }

    expect(restored.match(nodeId, node, adapter)).toBe(true);
    const updated = restored.apply(nodeId, node, adapter) as DotAdapter;
    const updatedNode = updated.getNodeAttributes(nodeId);
    if (!updatedNode) {
      throw new Error('missing updated node');
    }

    const icon = AwsIcon.fromTerraformResource('aws_lambda_function');
    expect(icon).toBeDefined();

    const layout = updatedNode.hints?.layout;
    expect(layout?.image).toBe(icon?.filePath('png'));
  });

  it('normalizes file URLs when using filePath mode', () => {
    const rule = makeRule({ imageMode: 'filePath' });
    const { graph, nodeId } = makeGraph('aws_lambda_function');
    const adapter = new DotAdapter().withTgGraph(graph);
    const node = adapter.getNodeAttributes(nodeId);
    if (!node) {
      throw new Error('missing node');
    }

    const fakeFileUrl = 'file:///tmp/aws-icon.svg';
    const spy = jest.spyOn(AwsIcon, 'fromTerraformResource').mockReturnValue({
      url: () => fakeFileUrl,
      filePath: () => fakeFileUrl,
      hasFormat: () => true,
      key: 'fake',
      label: 'Fake',
      path: () => fakeFileUrl,
      filename: () => 'aws-icon.svg',
    } as unknown as AwsIcon);

    try {
      expect(rule.match(nodeId, node, adapter)).toBe(true);
      const updated = rule.apply(nodeId, node, adapter) as DotAdapter;
      const updatedNode = updated.getNodeAttributes(nodeId);
      if (!updatedNode) {
        throw new Error('missing updated node');
      }

      const layout = updatedNode.hints?.layout;
      expect(layout?.image).toBe(fileURLToPath(fakeFileUrl));
    } finally {
      spy.mockRestore();
    }
  });

  it('throws when requested format is missing in node runtimes', () => {
    const rule = makeRule({ imageFormat: 'png' });
    const { graph, nodeId } = makeGraph('aws_lambda_function');
    const adapter = new DotAdapter().withTgGraph(graph);
    const node = adapter.getNodeAttributes(nodeId);
    if (!node) {
      throw new Error('missing node');
    }

    const spy = jest.spyOn(AwsIcon, 'fromTerraformResource').mockReturnValue({
      url: () => 'file:///tmp/missing.png',
      filePath: () => 'file:///tmp/missing.png',
      hasFormat: () => false,
      key: 'fake',
      label: 'Fake',
      path: () => 'file:///tmp/missing.png',
      filename: () => 'missing.png',
    } as unknown as AwsIcon);

    try {
      expect(rule.match(nodeId, node, adapter)).toBe(true);
      expect(() => rule.apply(nodeId, node, adapter)).toThrow(
        'Missing png format for AWS icon fake',
      );
    } finally {
      spy.mockRestore();
    }
  });

  it('throws when fallback icon is missing the requested format in node runtimes', () => {
    const rule = makeRule({ imageFormat: 'png' });
    const { graph, nodeId } = makeGraph('aws_missing_resource');
    const adapter = new DotAdapter().withTgGraph(graph);
    const node = adapter.getNodeAttributes(nodeId);
    if (!node) {
      throw new Error('missing node');
    }

    const mappedSpy = jest.spyOn(AwsIcon, 'fromTerraformResource').mockReturnValue(undefined);
    const fallbackSpy = jest.spyOn(AwsIcon, 'fromManifestKey').mockReturnValue({
      url: () => 'file:///tmp/missing.png',
      filePath: () => 'file:///tmp/missing.png',
      hasFormat: () => false,
      key: 'fake-fallback',
      label: 'Fake fallback',
      path: () => 'file:///tmp/missing.png',
      filename: () => 'missing.png',
    } as unknown as AwsIcon);

    try {
      expect(rule.match(nodeId, node, adapter)).toBe(true);
      expect(() => rule.apply(nodeId, node, adapter)).toThrow(
        'Missing png format for AWS icon fake-fallback',
      );
    } finally {
      mappedSpy.mockRestore();
      fallbackSpy.mockRestore();
    }
  });

  it('throws when built-in fallback icon key is not registered', () => {
    const rule = makeRule();
    const { graph, nodeId } = makeGraph('aws_missing_resource');
    const adapter = new DotAdapter().withTgGraph(graph);
    const node = adapter.getNodeAttributes(nodeId);
    if (!node) {
      throw new Error('missing node');
    }

    const mappedSpy = jest.spyOn(AwsIcon, 'fromTerraformResource').mockReturnValue(undefined);
    const fallbackSpy = jest.spyOn(AwsIcon, 'fromManifestKey').mockReturnValue(undefined);

    try {
      expect(rule.match(nodeId, node, adapter)).toBe(true);
      expect(() => rule.apply(nodeId, node, adapter)).toThrow(
        "Fallback AWS icon 'aws-cloud' is not registered",
      );
    } finally {
      mappedSpy.mockRestore();
      fallbackSpy.mockRestore();
    }
  });

  it('returns early if a matched node loses terraform data', () => {
    const rule = makeRule();
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
    const rule = makeRule();
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

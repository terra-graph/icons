import { fileURLToPath } from 'node:url';
import {
  type AdapterOperations,
  DotAdapter,
  type NodeId,
  NodeRule,
  type NodeRuleConfig,
  type TgNodeAttributes,
} from '@terra-graph/core';
import { AwsIcon } from '../AwsIcon.js';

export interface DotNodeOptions extends Record<string, unknown> {
  shape: string;
  imagescale: boolean;
  labelloc: string;
  height: number;
  width: number;
  fixedsixe: boolean;
  imagepos: string;
}

type ResolvedAwsDotIconOptions = {
  imageMode: 'url' | 'filePath';
  imageFormat: 'svg' | 'png';
  dot: DotNodeOptions;
};

const defaultDotAttributes: DotNodeOptions = {
  shape: 'plaintext', // none
  imagescale: true,
  labelloc: 'b',
  height: 1.6,
  width: 1.2,
  fixedsixe: true,
  imagepos: 'tc',
};

export interface DotIconRuleOptions extends Record<string, unknown> {
  imageMode?: 'url' | 'filePath';
  imageFormat?: 'svg' | 'png';
  // dot?: Record<string, unknown>;
  dot?: DotNodeOptions;
}

const resolveOptions = (options: DotIconRuleOptions | undefined): ResolvedAwsDotIconOptions => {
  return {
    imageMode: options?.imageMode ?? 'filePath',
    imageFormat: options?.imageFormat ?? 'svg',
    dot: { ...defaultDotAttributes, ...(options?.dot ?? {}) },
  };
};

const getTerraformResource = (node: TgNodeAttributes): string | undefined => {
  const terraform = node.terraform;
  if (!terraform || typeof terraform !== 'object') {
    return undefined;
  }

  const resource = (terraform as Record<string, unknown>).resource;
  return typeof resource === 'string' ? resource : undefined;
};

const normalizeFilePath = (value: string): string => {
  if (value.startsWith('file://')) {
    return fileURLToPath(value);
  }
  return value;
};

const isNodeRuntime = (): boolean => {
  return typeof process !== 'undefined' && typeof process.versions?.node === 'string';
};

export class AwsDotIconRule extends NodeRule {
  public override supports(adapter: AdapterOperations): boolean {
    return adapter instanceof DotAdapter;
  }

  public override apply(
    nodeId: NodeId,
    node: TgNodeAttributes,
    graph: AdapterOperations,
  ): AdapterOperations {
    if (!this.wasMatched(nodeId)) {
      return graph;
    }

    const terraformResource = getTerraformResource(node);
    if (!terraformResource) {
      return graph;
    }

    const icon = AwsIcon.fromTerraformResource(terraformResource);
    if (!icon) {
      return graph;
    }

    const resolvedOptions = resolveOptions(this.config.options as DotIconRuleOptions | undefined);
    const imageFormat = resolvedOptions.imageFormat;

    if (isNodeRuntime() && !icon.hasFormat(imageFormat)) {
      throw new Error(`Missing ${imageFormat} format for AWS icon ${icon.key}`);
    }

    const iconUrl = icon.url(imageFormat);
    const iconFilePath =
      resolvedOptions.imageMode === 'filePath'
        ? normalizeFilePath(icon.filePath(imageFormat))
        : undefined;
    const image = iconFilePath ?? iconUrl;

    const adapterKey = DotAdapter.name;
    const adapterAttributes = {
      ...(node.adapter?.[adapterKey] ?? {}),
      ...resolvedOptions.dot,
      image,
    };

    return graph.setNodeAttributes(nodeId, {
      ...node,
      // icon: {
      //   provider: "aws",
      //   key: icon.key,
      //   label: icon.label,
      //   url: iconUrl,
      //   filePath: iconFilePath,
      // },
      adapter: {
        ...(node.adapter ?? {}),
        [adapterKey]: adapterAttributes,
      },
    });
  }
}

NodeRule.register(AwsDotIconRule);

import { fileURLToPath } from 'node:url';
import {
  type AdapterOperations,
  type NodeId,
  NodeRule,
  type TgNodeAttributes,
} from '@terra-graph/core';
import { AwsIcon } from '../AwsIcon.js';

type ResolvedAwsDotIconOptions = {
  imageMode: 'url' | 'filePath';
  imageFormat: 'svg' | 'png';
};

const DEFAULT_FALLBACK_ICON_KEY = 'aws-cloud';

export interface IconRuleOptions extends Record<string, unknown> {
  imageMode?: 'url' | 'filePath';
  imageFormat?: 'svg' | 'png';
}

const resolveOptions = (options: IconRuleOptions | undefined): ResolvedAwsDotIconOptions => {
  return {
    imageMode: options?.imageMode ?? 'filePath',
    imageFormat: options?.imageFormat ?? 'svg',
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

export class AwsIconRule extends NodeRule {
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

    const icon =
      AwsIcon.fromTerraformResource(terraformResource) ??
      AwsIcon.fromManifestKey(DEFAULT_FALLBACK_ICON_KEY);
    if (!icon) {
      throw new Error(`Fallback AWS icon '${DEFAULT_FALLBACK_ICON_KEY}' is not registered`);
    }

    const resolvedOptions = resolveOptions(this.config.options as IconRuleOptions | undefined);
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

    return graph.setNodeAttributes(nodeId, {
      ...node,
      hints: {
        ...(node.hints ?? {}),
        layout: {
          ...(node.hints?.layout ?? {}),
          image,
        },
      },
    });
  }
}

NodeRule.register(AwsIconRule);

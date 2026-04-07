import { NodeRule } from '@terra-graph/core';
import { AwsDotIconRule } from './AwsDotIconRule.js';

// register rules
NodeRule.register(AwsDotIconRule);

export * from './AwsDotIconRule.js';

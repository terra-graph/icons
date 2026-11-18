import './rules/registerAll.js';
import provider from './provider.js';

export * from './browser.js';
export * from './plugins/AwsIconPlugin.js';
export * from './rules/index.js';
export { provider };
export const runtimeProvider = provider;
export default provider;

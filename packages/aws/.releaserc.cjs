const createReleaseConfig = require("../../release.base.cjs");

module.exports = createReleaseConfig({
  packageDir: "packages/aws",
  packageName: "terra-graph-icons-aws",
  scope: "aws"
});

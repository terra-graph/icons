# @terra-graph/icons-aws

AWS icon package for Terra Graph.

## Design goals

- Keep the original AWS downloaded folder structure intact under `vendor/aws`
- Look up icons by Terraform resource name
- Generate icon metadata from the raw AWS asset bundle
- Avoid forcing consumers to understand the AWS nested directory layout

## Important

Do not modify the AWS-provided assets. Replace the contents under `vendor/aws` with the latest AWS download and re-run the generate script.

## Vendor asset layout

Place the extracted AWS icon bundle under:

```text
vendor/aws/
```

The generator scans recursively, so the exact nested AWS folder layout is preserved.

## Generate manifest

```bash
yarn generate
```

This writes `generated/aws-icon-manifest.json`.

## Build

```bash
yarn build
```

## Usage

```ts
import { AwsIcon, terraformAwsIconMap } from "@terra-graph/icons-aws";

const lambdaIcon = AwsIcon.fromTerraformResource("aws_lambda_function")?.url("svg");
const allIcons = terraformAwsIconMap;
```

## Dot plugin

`@terra-graph/icons-aws:plugin:dot` decorates nodes that have a
`terraform.resource` attribute starting with `aws_`. It sets dot adapter
attributes (including `image`) so Graphviz can render the AWS icon.

The default `imageMode` is `filePath` (absolute filesystem path). Use `url`
for browser contexts.

```yaml
providers:
  - "@terra-graph/icons-aws"

profiles:
  my_profile:
    plugins:
      - plugin: "@terra-graph/icons-aws:plugin:dot"
        options:
          imageMode: filePath
          imageFormat: svg
          dot:
            labelloc: b
            imagescale: true
```

## Mapping strategy

- `generated/aws-icon-manifest.json` is generated from files on disk
- `mappings/terraform-aws-icons.json` is curated and maps Terraform resource names to manifest keys
- runtime resolution joins the two

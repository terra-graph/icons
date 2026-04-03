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

const lambdaIcon = AwsIcon.fromTerraformResource("aws_lambda_function")?.url();
const allIcons = terraformAwsIconMap;
```

## Mapping strategy

- `generated/aws-icon-manifest.json` is generated from files on disk
- `mappings/terraform-aws-icons.json` is curated and maps Terraform resource names to manifest keys
- runtime resolution joins the two

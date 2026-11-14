# terra-graph-icons

Monorepo for Terra Graph icon packages.

## Packages

- `@terra-graph/icons-aws` — AWS architecture icon wrapper package with Terraform resource lookups.

## Monorepo notes

This repository uses Yarn workspaces, with independently published packages under `packages/`.

## Getting started

```bash
yarn install
```

Generate AWS icon metadata:

```bash
yarn generate
```

Build all packages:

```bash
yarn build
```

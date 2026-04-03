# terra-graph-icons

Monorepo for Terra Graph icon packages.

## Packages

- `@terra-graph/icons-aws` — AWS architecture icon wrapper package with Terraform resource lookups.

## Monorepo notes

This is a standard Yarn workspaces monorepo layout. I do not have your earlier `terra-graph-conventions` repo available here, so this follows the same general approach rather than reproducing that repo verbatim.

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

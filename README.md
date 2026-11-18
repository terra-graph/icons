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

## Publishing

See [PUBLISHING.md](./PUBLISHING.md) for npm trusted publisher setup and release verification.

## Common verification

Use Node `24.22.3` from `.nvmrc` and Yarn `1.22.22` (`corepack enable`). Run `yarn install --frozen-lockfile`, then `yarn verify`. Verification runs read-only lint, explicit no-emit type checks, a clean build, and unit tests, followed by installed-tarball consumer checks. It may write ignored build and coverage artifacts, but must not change tracked files.

`yarn lint` and `yarn lint:ci` are read-only. `yarn format` explicitly rewrites formatting; builds do not format or fix source files. Lint coverage and rules remain repository-specific. Database integration tests and live model evaluations remain opt-in.

PRs run `yarn verify`. Existing release workflows require a successful verification job; monorepo release jobs verify again after synchronizing their checkout.

`yarn test:consumer` requires a completed build and registry access. It packs without lifecycle scripts, installs tarballs in temporary projects with declared peers and TypeScript/Node typings, checks runtime exports and consumer declarations, and always removes its temporary directory. Dual-format libraries are exercised through both import and require; ESM-only packages retain that contract.

Verification also validates icon mappings and bundled browser exports, and checks the packaged icon assets.

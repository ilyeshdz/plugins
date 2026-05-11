# Shelter plugins

A collection of stable and useful plugins for Shelter.

> Made with ❤️ by [Ilyes Hernandez](https://github.com/ilyeshdz)

## Plugins

- [Browser](https://ilyeshdz.github.io/plugins/browser)
- [Leaver](https://ilyeshdz.github.io/plugins/leaver)

## Development

```sh
pnpm install
pnpm run check
```

Useful commands:

- `pnpm run fmt:check` checks formatting.
- `pnpm run lint` runs Oxlint.
- `pnpm run typecheck` runs TypeScript without emitting files.
- `pnpm run build` builds all plugins with Lune.

## Structure

- `plugins/*` contains each Shelter plugin entrypoint, pages, icons, and
  manifest.
- `components` contains shared Solid UI pieces.
- `lib/shelter` contains adapters around the Shelter runtime.
- `lib` contains feature services and reusable utilities.
- `lune-ssg` contains the static site templates used for GitHub Pages.

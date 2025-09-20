# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-20

### Added
- Initial release of RegexPlay.
- Interactive TUI mode with real-time match highlighting.
- CLI for direct testing.
- JavaScript regex engine support.
- Session management (save/load).
- Comprehensive documentation and test suite.

## [1.0.1] - 2025-09-20

### Added
- Programmatic entry point `index.js` for requiring `regexplay` as a module.
- Release & quality automation scripts: `test:all`, `prepublishOnly`, `release`.

### Changed
- Enhanced `package.json` metadata (`files`, `preferGlobal`, `sideEffects`, explicit `type`).
- Added comprehensive test scripts aggregation.

### Internal
- No functional runtime changes to core logic; metadata and distribution improvements only.

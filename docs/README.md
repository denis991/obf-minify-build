# obf-minify-build Documentation

## API Reference

### `build(options)`

Main function for building projects with minification and obfuscation.

#### Parameters

- `options` (Object): Configuration options
  - `src` (string): Source directory path (default: 'src')
  - `out` (string): Output directory path (default: 'build')
  - `make` (boolean): Use Makefile if available (default: true)

#### Example

```javascript
import { build } from 'obf-minify-build';

// Basic usage
build();

// With custom options
build({
  src: 'source',
  out: 'dist',
  make: false
});
```

## Configuration

### Makefile Configuration

The project uses a Makefile for build automation. Key variables in `config.mk`:

- `SRC_DIR`: Source directory (default: src)
- `BUILD_DIR`: Output directory (default: build)
- `IGNORE_CSS`: CSS files to ignore during minification
- `IGNORE_HTML`: HTML files to ignore during minification
- `IGNORE_JS`: JS files to ignore during obfuscation

### Obfuscation Settings

JavaScript obfuscation is configured in `obfuscator.json`:

```json
{
  "compact": true,
  "controlFlowFlattening": true,
  "controlFlowFlatteningThreshold": 1,
  "deadCodeInjection": true,
  "deadCodeInjectionThreshold": 1,
  "debugProtection": true,
  "debugProtectionInterval": true,
  "disableConsoleOutput": true,
  "identifierNamesGenerator": "hexadecimal",
  "log": false,
  "renameGlobals": true,
  "rotateStringArray": true,
  "selfDefending": true,
  "stringArray": true,
  "stringArrayEncoding": "base64",
  "stringArrayThreshold": 1,
  "transformObjectKeys": true
}
```

## Build Process

1. **Clean**: Remove previous build directory
2. **Copy**: Copy source files to build directory
3. **Minify CSS**: Minify CSS files using clean-css
4. **Minify HTML**: Minify HTML files using html-minifier
5. **Obfuscate JS**: Obfuscate JavaScript files
6. **Obfuscate HTML inline**: Process inline scripts in HTML
7. **Hash assets**: Add content hashes to asset filenames

## File Structure

```
src/
├── html/          # HTML files
├── css/           # CSS files
├── js/            # JavaScript files
├── assets/        # Static assets (images, etc.)
└── resources/     # Additional resources
```

## CLI Usage

```bash
# Basic build (uses Makefile)
npx obf-minify-build

# Custom source and output directories
npx obf-minify-build --src source --out dist

# Use Node.js build instead of Makefile
npx obf-minify-build --no-make

# Combine custom paths with Node.js build
npx obf-minify-build --src source --out dist --no-make

# Show help
npx obf-minify-build --help
```

### CLI Parameters

- `--src <dir>` - Source directory (default: `src`)
- `--out <dir>` - Output directory (default: `build`)
- `--no-make` - Use Node.js build instead of Makefile
- `--help, -h` - Show help information

### Build Methods

1. **Makefile Build** (default): Uses system Makefile for maximum performance
   - Requires: `make`, `cpio`, `find`
   - Best for: Production builds, CI/CD

2. **Node.js Build**: Pure JavaScript implementation
   - Requires: Only Node.js
   - Best for: Cross-platform compatibility, custom configurations

## Protection Features

The build includes client-side protection mechanisms:

- **protection.js**: Anti-debugging and tampering protection
- **protection.css**: CSS-based protection against inspection
- **Asset hashing**: Prevents cache issues and adds security
- **Code obfuscation**: Makes reverse engineering difficult

## Requirements

- Node.js >= 18
- Linux/macOS/WSL (for Makefile support)
- Required tools: cpio, find, make

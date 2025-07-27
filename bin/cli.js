#!/usr/bin/env node
import { build } from '../lib/index.js';

const args = process.argv.slice(2);
const opts = {};

// Parse arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--src' && args[i+1]) opts.src = args[++i];
  if (args[i] === '--out' && args[i+1]) opts.out = args[++i];
  if (args[i] === '--no-make') opts.make = false;
  if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Usage: npx obf-minify-build [options]

Options:
  --src <dir>     Source directory (default: src)
  --out <dir>     Output directory (default: build)
  --no-make       Use Node.js build instead of Makefile
  --help, -h      Show this help

Examples:
  npx obf-minify-build
  npx obf-minify-build --src src --out dist
  npx obf-minify-build --no-make
`);
    process.exit(0);
  }
}

try {
  build(opts);
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
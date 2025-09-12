#!/usr/bin/env node
import { build } from '../lib/index.js';

const args = process.argv.slice(2);
const opts = {};

// Parse arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--src' && args[i+1]) opts.src = args[++i];
  if (args[i] === '--out' && args[i+1]) opts.out = args[++i];
  if (args[i] === '--no-make') opts.make = false;
  if (args[i] === '--inline-css') opts.inlineCss = true;
  if (args[i] === '--inline-js') opts.inlineJs = true;
  if (args[i] === '--inline-all') opts.inlineAll = true;
  if (args[i] === '--generate-index') opts.generateIndex = true;
  if (args[i] === '--skip-obfuscation') opts.skipObfuscation = true;
  if (args[i] === '--skip-obfuscation-for' && args[i+1]) {
    opts.skipObfuscationFor = args[++i].split(',');
  }
  if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Usage: npx obf-minify-build [options]

Options:
  --src <dir>                    Source directory (default: src)
  --out <dir>                    Output directory (default: build)
  --no-make                      Use Node.js build instead of Makefile
  --inline-css                   Inline CSS files into HTML
  --inline-js                    Inline JS files into HTML
  --inline-all                   Inline all resources (CSS + JS)
  --generate-index               Generate index.html if not found
  --skip-obfuscation             Skip obfuscation completely
  --skip-obfuscation-for <list>  Skip obfuscation for files (comma-separated)
  --help, -h                     Show this help

Examples:
  npx obf-minify-build
  npx obf-minify-build --src src --out dist
  npx obf-minify-build --no-make
  npx obf-minify-build --inline-all --out dist
  npx obf-minify-build --inline-css --inline-js
  npx obf-minify-build --skip-obfuscation-for vendor,libs
`);
    process.exit(0);
  }
}

try {
  // If custom src/out paths are provided, use Node.js build
  if (opts.src || opts.out) {
    opts.make = false;
  }
  build(opts);
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
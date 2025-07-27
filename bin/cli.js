#!/usr/bin/env node
import { build } from '../lib/index.js';

const args = process.argv.slice(2);
const opts = {};
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--src' && args[i+1]) opts.src = args[++i];
  if (args[i] === '--out' && args[i+1]) opts.out = args[++i];
  if (args[i] === '--no-make') opts.make = false;
}

build(opts);
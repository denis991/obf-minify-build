#!/usr/bin/env node
const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');
const [,, htmlPath] = process.argv;

if (!htmlPath) {
	console.error('Usage: node obfuscate-html-inline.js <path/to/index.html>');
	process.exit(1);
}

let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(
	/<script>([\s\S]*?)<\/script>/gi,
	(_, code) => {
		const obf = JavaScriptObfuscator
			.obfuscate(code, { compact: true, controlFlowFlattening: true })
			.getObfuscatedCode();
		return `<script>${obf}</script>`;
	}
);
fs.writeFileSync(htmlPath, html, 'utf8');
console.log(`✅ Inline-скрипты обфусцированы в ${htmlPath}`);
// chmod +x scripts/obfuscate-html-inline.js
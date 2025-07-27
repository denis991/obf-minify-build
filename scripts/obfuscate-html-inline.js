#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import JavaScriptObfuscator from 'javascript-obfuscator';

const [,, buildDir] = process.argv;

if (!buildDir) {
	console.error('Usage: node obfuscate-html-inline.js <build-directory>');
	process.exit(1);
}

// Функция для поиска HTML файлов по приоритету
function findHtmlFiles(dir) {
	const htmlFiles = [];

	// 1. Сначала ищем в корне build директории
	const rootFiles = fs.readdirSync(dir, { withFileTypes: true });
	rootFiles.forEach(file => {
		if (file.isFile() && file.name.endsWith('.html')) {
			htmlFiles.push(path.join(dir, file.name));
		}
	});

	// 2. Затем ищем в подпапках по алфавиту (логичный порядок)
	const subdirs = rootFiles
		.filter(file => file.isDirectory())
		.map(file => file.name)
		.sort(); // алфавитный порядок

	subdirs.forEach(subdir => {
		const subdirPath = path.join(dir, subdir);
		const subdirFiles = fs.readdirSync(subdirPath, { withFileTypes: true });

		subdirFiles.forEach(file => {
			if (file.isFile() && file.name.endsWith('.html')) {
				htmlFiles.push(path.join(subdirPath, file.name));
			}
		});
	});

	return htmlFiles;
}

// Находим все HTML файлы
const htmlFiles = findHtmlFiles(buildDir);

if (htmlFiles.length === 0) {
	console.log('⚠️  HTML файлы не найдены в', buildDir);
	process.exit(0);
}

console.log(`🔍 Найдено HTML файлов: ${htmlFiles.length}`);

// Обрабатываем каждый HTML файл
htmlFiles.forEach(htmlPath => {
	try {
		let html = fs.readFileSync(htmlPath, 'utf8');
		const originalHtml = html;

		// Обфусцируем inline скрипты
		html = html.replace(
			/<script(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/gi,
			(match, code) => {
				// Пропускаем пустые скрипты
				if (!code.trim()) return match;

				try {
					const obf = JavaScriptObfuscator
						.obfuscate(code, {
							compact: true,
							controlFlowFlattening: true,
							stringArray: true,
							stringArrayThreshold: 0.75
						})
						.getObfuscatedCode();
					return `<script>${obf}</script>`;
				} catch (error) {
					console.warn(`⚠️  Ошибка обфускации в ${path.relative(buildDir, htmlPath)}:`, error.message);
					return match; // возвращаем оригинал при ошибке
				}
			}
		);

		// Записываем только если что-то изменилось
		if (html !== originalHtml) {
			fs.writeFileSync(htmlPath, html, 'utf8');
			console.log(`✅ Обфусцирован: ${path.relative(buildDir, htmlPath)}`);
		} else {
			console.log(`ℹ️  Пропущен (нет inline-скриптов): ${path.relative(buildDir, htmlPath)}`);
		}

	} catch (error) {
		console.error(`❌ Ошибка обработки ${path.relative(buildDir, htmlPath)}:`, error.message);
	}
});

console.log('🎉 Обфускация inline-скриптов завершена!');
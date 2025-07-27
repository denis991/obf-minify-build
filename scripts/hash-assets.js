const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const glob = require('glob');
const replace = require('replace-in-file');

const buildDir = process.argv[2];
if (!buildDir) {
	console.error('Ошибка: Не указана директория сборки. Пример: node scripts/hash-assets.js build');
	process.exit(1);
}

const assetExts = ['.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'];
const assetFiles = glob.sync(`${buildDir}/**/*.{js,css,png,jpg,jpeg,svg,gif,webp}`);
const manifest = {};

// 1. Хешируем и переименовываем каждый ассет
assetFiles.forEach((file) => {
	const fileExt = path.extname(file);
	if (!assetExts.includes(fileExt)) return;

	const fileBuffer = fs.readFileSync(file);
	const hash = crypto.createHash('sha1').update(fileBuffer).digest('hex').slice(0, 8);

	const originalName = path.basename(file);
	const newName = `${path.basename(file, fileExt)}.${hash}${fileExt}`;
	const newPath = path.join(path.dirname(file), newName);

	fs.renameSync(file, newPath);

	// Сохраняем соответствие старого и нового имени
	manifest[originalName] = newName;
	console.log(`- Переименован: ${originalName} -> ${newName}`);
});

// 2. Обновляем ссылки в HTML, CSS и JS файлах
const filesToUpdate = glob.sync(`${buildDir}/**/*.{html,css,js}`);

console.log('\n- Обновление ссылок в файлах...');
for (const originalName in manifest) {
	const newName = manifest[originalName];
	try {
		const results = replace.sync({
			files: filesToUpdate,
			from: new RegExp(originalName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'),
			to: newName,
			countMatches: true,
		});
		results.forEach((result) => {
			if (result.hasChanged) {
				console.log(`  - Замена в ${path.relative(buildDir, result.file)}`);
			}
		});
	} catch (error) {
		console.error('Ошибка при замене файла:', error);
	}
}

console.log('\n✅ Хеширование и обновление ссылок завершено!');
import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

/**
 * Обнаруживает и анализирует файлы в проекте
 */
export class FileDiscoverer {
  constructor(options = {}) {
    this.options = {
      srcDir: 'src',
      buildDir: 'build',
      ...options
    };
  }

  /**
   * Находит все файлы в проекте
   */
  discoverFiles(srcDir = this.options.srcDir) {
    console.log(`🔍 Поиск файлов в ${srcDir}...`);
    
    const files = {
      html: [],
      css: [],
      js: [],
      assets: [],
      resources: []
    };

    if (!fs.existsSync(srcDir)) {
      console.log(`⚠️ Папка ${srcDir} не найдена`);
      return files;
    }

    // HTML файлы
    files.html = globSync(`${srcDir}/**/*.html`);
    
    // CSS файлы
    files.css = globSync(`${srcDir}/**/*.css`);
    
    // JS файлы
    files.js = globSync(`${srcDir}/**/*.js`);
    
    // Ассеты (изображения, шрифты)
    files.assets = globSync(`${srcDir}/**/*.{png,jpg,jpeg,gif,svg,webp,woff,woff2,ttf,otf,ico}`);
    
    // Ресурсы (другие файлы)
    files.resources = globSync(`${srcDir}/**/*.{json,xml,txt,md,pdf}`);

    console.log(`📁 Найдено файлов:`);
    console.log(`  HTML: ${files.html.length}`);
    console.log(`  CSS: ${files.css.length}`);
    console.log(`  JS: ${files.js.length}`);
    console.log(`  Ассеты: ${files.assets.length}`);
    console.log(`  Ресурсы: ${files.resources.length}`);

    return files;
  }

  /**
   * Находит корневой HTML файл
   */
  findRootHtml(srcDir = this.options.srcDir) {
    const possibleRoots = [
      path.join(srcDir, 'index.html'),
      path.join(srcDir, 'html', 'index.html'),
      path.join(process.cwd(), 'index.html')
    ];

    for (const rootPath of possibleRoots) {
      if (fs.existsSync(rootPath)) {
        console.log(`📄 Найден корневой HTML: ${rootPath}`);
        return rootPath;
      }
    }

    // Ищем любой HTML файл
    const htmlFiles = globSync(`${srcDir}/**/*.html`);
    if (htmlFiles.length > 0) {
      console.log(`📄 Используем первый найденный HTML: ${htmlFiles[0]}`);
      return htmlFiles[0];
    }

    console.log(`⚠️ HTML файлы не найдены`);
    return null;
  }

  /**
   * Анализирует зависимости HTML файла
   */
  analyzeHtmlDependencies(htmlPath) {
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const dependencies = {
      css: [],
      js: [],
      images: []
    };

    // CSS зависимости
    const cssRegex = /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/g;
    let match;
    while ((match = cssRegex.exec(htmlContent)) !== null) {
      dependencies.css.push(match[1]);
    }

    // JS зависимости
    const jsRegex = /<script[^>]+src=["']([^"']+)["'][^>]*><\/script>/g;
    while ((match = jsRegex.exec(htmlContent)) !== null) {
      dependencies.js.push(match[1]);
    }

    // Изображения
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
    while ((match = imgRegex.exec(htmlContent)) !== null) {
      dependencies.images.push(match[1]);
    }

    console.log(`🔗 Зависимости HTML:`);
    console.log(`  CSS: ${dependencies.css.length} файлов`);
    console.log(`  JS: ${dependencies.js.length} файлов`);
    console.log(`  Изображения: ${dependencies.images.length} файлов`);

    return dependencies;
  }

  /**
   * Проверяет существование зависимостей
   */
  validateDependencies(dependencies, baseDir) {
    const missing = {
      css: [],
      js: [],
      images: []
    };

    // Проверяем CSS
    for (const cssFile of dependencies.css) {
      const fullPath = path.resolve(baseDir, cssFile);
      if (!fs.existsSync(fullPath)) {
        missing.css.push(cssFile);
      }
    }

    // Проверяем JS
    for (const jsFile of dependencies.js) {
      const fullPath = path.resolve(baseDir, jsFile);
      if (!fs.existsSync(fullPath)) {
        missing.js.push(jsFile);
      }
    }

    // Проверяем изображения
    for (const imgFile of dependencies.images) {
      const fullPath = path.resolve(baseDir, imgFile);
      if (!fs.existsSync(fullPath)) {
        missing.images.push(imgFile);
      }
    }

    if (missing.css.length > 0 || missing.js.length > 0 || missing.images.length > 0) {
      console.log(`⚠️ Отсутствующие файлы:`);
      if (missing.css.length > 0) console.log(`  CSS: ${missing.css.join(', ')}`);
      if (missing.js.length > 0) console.log(`  JS: ${missing.js.join(', ')}`);
      if (missing.images.length > 0) console.log(`  Изображения: ${missing.images.join(', ')}`);
    }

    return missing;
  }
}

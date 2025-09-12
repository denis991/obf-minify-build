import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import { minify } from 'html-minifier-terser';
import JavaScriptObfuscator from 'javascript-obfuscator';
import CleanCSS from 'clean-css';

/**
 * Обрабатывает HTML файлы с встраиванием CSS и JS
 */
export class HtmlProcessor {
  constructor(options = {}) {
    this.options = {
      inlineCss: false,
      inlineJs: false,
      inlineAll: false,
      assetInlineLimit: 8192,
      generateIndex: false,
      skipObfuscationFor: [],
      ...options,
    };
  }

  /**
   * Обрабатывает HTML файл
   */
  async processHtml(htmlPath, buildDir) {
    console.log(`🔍 Обработка HTML: ${htmlPath}`);

    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    let processedHtml = htmlContent;

    // Встраиваем CSS если нужно
    if (this.options.inlineCss || this.options.inlineAll) {
      processedHtml = await this.inlineCss(processedHtml, path.dirname(htmlPath));
    }

    // Встраиваем JS если нужно
    if (this.options.inlineJs || this.options.inlineAll) {
      processedHtml = await this.inlineJs(processedHtml, path.dirname(htmlPath));
    }

    // Минифицируем HTML
    processedHtml = await this.minifyHtml(processedHtml);

    // Сохраняем результат
    const outputPath = path.join(buildDir, 'base.html');
    fs.writeFileSync(outputPath, processedHtml);
    console.log(`✅ Создан base.html с встроенными ресурсами`);

    return outputPath;
  }

  /**
   * Встраивает CSS файлы в HTML
   */
  async inlineCss(html, baseDir) {
    const cssRegex = /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/g;
    let processedHtml = html;

    let match;
    while ((match = cssRegex.exec(html)) !== null) {
      const cssPath = path.resolve(baseDir, match[1]);

      if (fs.existsSync(cssPath)) {
        const cssContent = fs.readFileSync(cssPath, 'utf8');
        const minifiedCss = new CleanCSS().minify(cssContent).styles;

        // Заменяем link на style
        const styleTag = `<style>${minifiedCss}</style>`;
        processedHtml = processedHtml.replace(match[0], styleTag);

        console.log(`  📦 Встроен CSS: ${match[1]}`);
      } else {
        console.log(`  ⚠️ CSS файл не найден: ${cssPath}`);
      }
    }

    return processedHtml;
  }

  /**
   * Встраивает JS файлы в HTML
   */
  async inlineJs(html, baseDir) {
    const jsRegex = /<script[^>]+src=["']([^"']+)["'][^>]*><\/script>/g;
    let processedHtml = html;

    let match;
    while ((match = jsRegex.exec(html)) !== null) {
      const jsPath = path.resolve(baseDir, match[1]);

      if (fs.existsSync(jsPath)) {
        const jsContent = fs.readFileSync(jsPath, 'utf8');

        // Проверяем, нужно ли обфусцировать
        const shouldObfuscate = !this.options.skipObfuscation && !this.shouldSkipObfuscation(match[1]);
        const processedJs = shouldObfuscate ? JavaScriptObfuscator.obfuscate(jsContent, this.getObfuscatorConfig()).getObfuscatedCode() : jsContent;

        // Заменяем script src на inline с полным экранированием
        const escapedJs = this.escapeHtmlEntities(processedJs);
        const scriptTag = `<script>${escapedJs}</script>`;
        processedHtml = processedHtml.replace(match[0], scriptTag);

        console.log(`  📦 Встроен JS: ${match[1]} ${shouldObfuscate ? '(обфусцирован)' : ''}`);
      } else {
        console.log(`  ⚠️ JS файл не найден: ${jsPath}`);
      }
    }

    return processedHtml;
  }

  /**
   * Минифицирует HTML
   */
  async minifyHtml(html) {
    return await minify(html, {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      minifyCSS: true,
      minifyJS: false, // JS уже обработан отдельно
    });
  }

  /**
   * Проверяет, нужно ли пропустить обфускацию
   */
  shouldSkipObfuscation(filePath) {
    return this.options.skipObfuscationFor.some(skip => filePath.includes(skip));
  }

  /**
   * Экранирует HTML-сущности в JavaScript коде
   * Специально обрабатывает обфусцированный код
   */
  escapeHtmlEntities(jsCode) {
    // Сначала экранируем уже существующие HTML-сущности в обфусцированном коде
    let escaped = jsCode
      .replace(/&amp;/g, '&amp;amp;')  // Экранируем уже существующие &amp;
      .replace(/&lt;/g, '&amp;lt;')    // Экранируем уже существующие &lt;
      .replace(/&gt;/g, '&amp;gt;')    // Экранируем уже существующие &gt;
      .replace(/&quot;/g, '&amp;quot;') // Экранируем уже существующие &quot;
      .replace(/&#39;/g, '&amp;#39;')   // Экранируем уже существующие &#39;
      .replace(/&#x27;/g, '&amp;#x27;') // Экранируем уже существующие &#x27;
      .replace(/&#x2F;/g, '&amp;#x2F;') // Экранируем уже существующие &#x2F;
      .replace(/&#x60;/g, '&amp;#x60;') // Экранируем уже существующие &#x60;
      .replace(/&#x3D;/g, '&amp;#x3D;') // Экранируем уже существующие &#x3D;
      .replace(/&#x3C;/g, '&amp;#x3C;') // Экранируем уже существующие &#x3C;
      .replace(/&#x3E;/g, '&amp;#x3E;'); // Экранируем уже существующие &#x3E;

    // Затем экранируем основные символы
    escaped = escaped
      .replace(/&/g, '&amp;')          // Экранируем оставшиеся &
      .replace(/</g, '&lt;')           // Экранируем <
      .replace(/>/g, '&gt;')           // Экранируем >
      .replace(/"/g, '&quot;')         // Экранируем "
      .replace(/'/g, '&#39;');         // Экранируем '

    return escaped;
  }

  /**
   * Получает конфигурацию обфускатора
   */
  getObfuscatorConfig() {
    try {
      const configPath = path.join(process.cwd(), 'obfuscator.json');
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (error) {
      console.log('⚠️ Не удалось загрузить obfuscator.json, используется конфигурация по умолчанию');
    }

    return {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.8,
      stringArrayEncoding: ['base64'],
      selfDefending: true,
      renameGlobals: true,
      transformObjectKeys: true,
    };
  }

  /**
   * Создает index.html если отсутствует
   */
  generateIndexHtml(buildDir) {
    const indexPath = path.join(buildDir, 'index.html');

    if (!fs.existsSync(indexPath)) {
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Built with obf-minify-build</title>
</head>
<body>
    <h1>Welcome to Your Project</h1>
    <p>This project was built with obf-minify-build.</p>
    <p>Add your content to the src/ directory and rebuild.</p>
</body>
</html>`;

      fs.writeFileSync(indexPath, htmlContent);
      console.log('✅ Создан index.html');
    }
  }
}

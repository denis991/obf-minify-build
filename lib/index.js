import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { globSync } from 'glob';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { replaceInFile } from 'replace-in-file';
import crypto from 'crypto';

export function build({ src = 'src', out = 'build', make = true } = {}) {
  if (make) {
    try {
      execSync('make all', { stdio: 'inherit' });
      return;
    } catch {
      console.log('Makefile not found, using Node.js build...');
    }
  }

  // Node.js implementation
  console.log('📦 Building with Node.js...');

  // Create build directory
  if (!fs.existsSync(out)) {
    fs.mkdirSync(out, { recursive: true });
  }

  // Copy files preserving structure
  const copyFiles = (srcDir, destDir) => {
    if (!fs.existsSync(srcDir)) {
      console.error(`Source directory ${srcDir} not found`);
      return;
    }

    const files = fs.readdirSync(srcDir, { withFileTypes: true });
    files.forEach(file => {
      const srcPath = path.join(srcDir, file.name);
      const destPath = path.join(destDir, file.name);

      if (file.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyFiles(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  };

  // Copy source files to build directory
  copyFiles(src, out);

  // Generate and write index.html (only if no existing HTML files)
  const generateHTML = () => {
    const htmlFiles = globSync(`${out}/**/*.html`);

    // If HTML files already exist, don't generate a new one
    if (htmlFiles.length > 0) {
      console.log('✅ Found existing HTML files, skipping generation');
      return;
    }

    const htmlPath = path.join(out, 'index.html');

    // Detect CSS files
    const cssFiles = globSync(`${out}/**/*.css`);
    // Detect JS files
    const jsFiles = globSync(`${out}/**/*.js`);
    // Detect image files
    const imageFiles = globSync(`${out}/**/*.{png,jpg,jpeg,svg,gif,webp}`);

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Built with obf-minify-build</title>
    ${cssFiles.map(file => `<link rel="stylesheet" href="${path.relative(out, file)}">`).join('\n    ')}
    ${jsFiles.map(file => `<script defer src="${path.relative(out, file)}"></script>`).join('\n    ')}
    <!-- Protection Scripts -->
    <script>
        window.__obfuscator = {
            check: function() {
                if (window.__obfuscator.__check) {
                    return;
                }
                window.__obfuscator.__check = true;
                const check = setInterval(() => {
                    if (document.readyState === 'complete') {
                        clearInterval(check);
                        if (!window.__obfuscator.__initialized) {
                            window.location.reload();
                        }
                    }
                }, 100);
            }
        };
    </script>
</head>
<body>
    <header>
        <h1>Welcome to Your Project</h1>
        ${
          imageFiles.length > 0
            ? `
        <div class="images">
            ${imageFiles
              .map(
                file => `
            <img src="${path.relative(out, file)}"
                 alt="${path.basename(file, path.extname(file))}"
                 class="asset-image">`,
              )
              .join('')}
        </div>`
            : ''
        }
    </header>
    <main>
        <p>This project was built with obf-minify-build.</p>
        <p>Add your content to the src/ directory and rebuild.</p>
    </main>
</body>
</html>`;

    fs.writeFileSync(htmlPath, htmlContent);
    console.log('✅ Generated index.html with automatic file detection');
  };

  // Obfuscate JavaScript files
  const obfuscateJS = () => {
    const jsFiles = globSync(`${out}/**/*.js`);
    
    // Load obfuscator config
    let obfuscatorConfig = {};
    try {
      const configPath = path.join(process.cwd(), 'obfuscator.json');
      if (fs.existsSync(configPath)) {
        obfuscatorConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (error) {
      console.log('⚠️ Could not load obfuscator.json, using default config');
    }
    
    jsFiles.forEach(file => {
      const code = fs.readFileSync(file, 'utf8');
      const obfuscated = JavaScriptObfuscator.obfuscate(code, obfuscatorConfig).getObfuscatedCode();
      fs.writeFileSync(file, obfuscated);
      console.log(`✅ Obfuscated ${file}`);
    });
  };

  // Hash assets and update references
  const hashAssets = () => {
    const assetExts = ['.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'];
    const assetFiles = globSync(`${out}/**/*.{js,css,png,jpg,jpeg,svg,gif,webp}`);
    const manifest = {};

    assetFiles.forEach(file => {
      const fileExt = path.extname(file);
      if (!assetExts.includes(fileExt)) return;

      const fileBuffer = fs.readFileSync(file);
      const hash = crypto.createHash('sha1').update(fileBuffer).digest('hex').slice(0, 8);
      const originalName = path.basename(file);
      const newName = `${path.basename(file, fileExt)}.${hash}${fileExt}`;
      const newPath = path.join(path.dirname(file), newName);

      fs.renameSync(file, newPath);
      manifest[originalName] = newName;
    });

    // Update HTML with hashed asset references
    const htmlFiles = globSync(`${out}/**/*.html`);
    htmlFiles.forEach(htmlPath => {
      const html = fs.readFileSync(htmlPath, 'utf8');
      let updatedHtml = html;

      for (const [originalName, newName] of Object.entries(manifest)) {
        const regex = new RegExp(originalName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
        updatedHtml = updatedHtml.replace(regex, newName);
      }

      fs.writeFileSync(htmlPath, updatedHtml);
      console.log(`✅ Updated asset references in ${path.relative(out, htmlPath)}`);
    });
  };

  // Execute build steps
  generateHTML();
  obfuscateJS();
  hashAssets();
  console.log('✅ Build completed');
}

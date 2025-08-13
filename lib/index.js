import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import glob from 'glob';
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

  // Generate and write index.html
  const generateHTML = () => {
    const htmlPath = path.join(out, 'index.html');
    
    // Detect CSS files
    const cssFiles = glob.sync(`${out}/css/*.css`);
    // Detect JS files
    const jsFiles = glob.sync(`${out}/script/*.js`);
    // Detect image files
    const imageFiles = glob.sync(`${out}/img/*.{png,jpg,jpeg,svg,gif,webp}`);

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            ${cssFiles.map(file => `
            <link rel="stylesheet" href="${path.relative(out, file)}" />
            `).join('')}
            ${jsFiles.map(file => `
            <script defer src="${path.relative(out, file)}"></script>
            `).join('')}
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
            ${imageFiles.map(file => `
            <img
                src="${path.relative(out, file)}"
                alt="${path.basename(file, path.extname(file))}"
                class="logo"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
            />
            <span class="logo-emoji" style="display: none; font-size: 50px">🎲</span>
            `).join('')}
            <h1 class="logo-title">Dice Roller</h1>

            <div class="controls">
                <button id="themeToggle" class="btn btn-sm">🌙</button>
                <select id="diceCount" class="form-select">
                    <option value="2">2 кубика</option>
                    <option value="3">3 кубика</option>
                    <option value="4">4 кубика</option>
                    <option value="5">5 кубика</option>
                </select>
                <button class="roll btn btn-outline-light">Бросить кости</button>
            </div>
            <div class="dice-container"></div>
        </body>
    </html>`;

    fs.writeFileSync(htmlPath, htmlContent);
    console.log('✅ Generated index.html with automatic file detection');
  };

  // Obfuscate JavaScript files
  const obfuscateJS = () => {
    const jsFiles = glob.sync(`${out}/**/*.js`);
    jsFiles.forEach(file => {
      const code = fs.readFileSync(file, 'utf8');
      const obfuscated = JavaScriptObfuscator.obfuscate(code, {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 1,
        debugProtection: true,
        debugProtectionInterval: true,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        renameGlobals: true,
        rotateStringArray: true,
        selfDefending: true,
        stringArray: true,
        stringArrayEncoding: 'base64',
        stringArrayThreshold: 1,
        transformObjectKeys: true
      }).getObfuscatedCode();
      fs.writeFileSync(file, obfuscated);
      console.log(`✅ Obfuscated ${file}`);
    });
  };

  // Hash assets and update references
  const hashAssets = () => {
    const assetExts = ['.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'];
    const assetFiles = glob.sync(`${out}/**/*.{js,css,png,jpg,jpeg,svg,gif,webp}`);
    const manifest = {};

    assetFiles.forEach((file) => {
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
    const htmlPath = path.join(out, 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    let updatedHtml = html;

    for (const [originalName, newName] of Object.entries(manifest)) {
      const regex = new RegExp(originalName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
      updatedHtml = updatedHtml.replace(regex, newName);
    }

    fs.writeFileSync(htmlPath, updatedHtml);
    console.log('✅ Updated asset references with hashes');
  };

  // Execute build steps
  generateHTML();
  obfuscateJS();
  hashAssets();
  console.log('✅ Build completed');
}

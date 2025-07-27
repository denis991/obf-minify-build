import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

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

  copyFiles(src, out);
  console.log('✅ Build completed');
}
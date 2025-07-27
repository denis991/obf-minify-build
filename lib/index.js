import { execSync } from 'child_process';
import path from 'path';

export function build({ src = 'src', out = 'build', make = true } = {}) {
  if (make) {
    execSync('make all', { stdio: 'inherit' });
    return;
  }
  // Альтернативно: реализовать сборку на JS (TODO)
  throw new Error('JS-only build не реализован. Используйте make=true.');
}
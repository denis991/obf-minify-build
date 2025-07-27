# obf-minify-build

Automated frontend build tool with minification, obfuscation, and protection features. CLI and API support.

📝 Features
✅ Fully automated build process
✅ Automatic file discovery with exclusions
✅ Single configuration for options and ignore lists
✅ CSS + HTML minification + JS and inline-scripts obfuscation
✅ Built-in client-side protections (via protection.js and protection.css)

---

## Quick Start

1. Place your source files in `src/` folder (html, css, js, assets).
2. Install dependencies:
   ```sh
   npm install
   ```
3. Build project:
   ```sh
   npm run build
   ```
4. Result is in `build/` folder.

## Usage as npm package

### CLI (no installation required)
```sh
npx obf-minify-build --src src --out build
```

### As dependency
1. Install as dev dependency:
   ```sh
   npm install obf-minify-build --save-dev
   ```
2. Use in your build script:
   ```js
   const { build } = require('obf-minify-build');
   build({ src: 'src', out: 'build' });
   ```

## Commands
- `npm run build` — full build
- `npm run dev` — rebuild on changes
- `npm run start` — build and start local server

## Requirements
- Node.js >= 18
- Linux/macOS/WSL (cpio, find, make)

---

# obf-minify-build (Русский)

Автоматизированный инструмент сборки фронтенда с минификацией, обфускацией и защитами. Поддержка CLI и API.

📝 Особенности
✅ Полностью автоматизированная сборка
✅ Автоматический поиск всех файлов с исключениями
✅ Единое место для настройки опций и игнор-листов
✅ Минификация CSS + HTML + обфускация JS и inline-скриптов
✅ Встроенные клиентские защиты (через protection.js и protection.css)

---

## Быстрый старт

1. Поместите исходники в папку `src/` (html, css, js, assets).
2. Установите зависимости:
   ```sh
   npm install
   ```
3. Соберите проект:
   ```sh
   npm run build
   ```
4. Готовый результат — в папке `build/`.

## Использование как npm-пакет

### CLI (без установки)
```sh
npx obf-minify-build --src src --out build
```

### Как зависимость
1. Установите как dev-зависимость:
   ```sh
   npm install obf-minify-build --save-dev
   ```
2. Используйте в build-скрипте:
   ```js
   const { build } = require('obf-minify-build');
   build({ src: 'src', out: 'build' });
   ```

## Команды
- `npm run build` — полная сборка
- `npm run dev` — пересборка при изменениях
- `npm run start` — сборка и запуск локального сервера

## Требования
- Node.js >= 18
- Linux/macOS/WSL (cpio, find, make)

---
Documentation and API — see [Wiki](./docs) or source code.
# Примеры использования obf-minify-build

## Базовый пример

### Структура проекта
```
my-project/
├── src/
│   ├── html/
│   │   └── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── assets/
│       └── logo.png
├── package.json
└── obfuscator.json
```

### package.json
```json
{
  "name": "my-project",
  "scripts": {
    "build": "npx obf-minify-build",
    "build:custom": "npx obf-minify-build --src src --out dist",
    "build:node": "npx obf-minify-build --no-make",
    "dev": "npx obf-minify-build && live-server build",
    "dev:custom": "npx obf-minify-build --src src --out dist && live-server dist"
  }
}
```

## Использование как npm пакет

### Установка
```bash
npm install obf-minify-build --save-dev
```

### В build скрипте
```javascript
// build.js
import { build } from 'obf-minify-build';

build({
  src: 'source',
  out: 'dist',
  make: false // использовать Node.js вместо Makefile
});
```

### В package.json
```json
{
  "scripts": {
    "build": "node build.js",
    "build:make": "make -f node_modules/obf-minify-build/Makefile"
  }
}
```

## Настройка обфускации

### obfuscator.json
```json
{
  "compact": true,
  "controlFlowFlattening": true,
  "controlFlowFlatteningThreshold": 0.75,
  "deadCodeInjection": true,
  "deadCodeInjectionThreshold": 0.4,
  "debugProtection": true,
  "debugProtectionInterval": 4000,
  "disableConsoleOutput": true,
  "identifierNamesGenerator": "hexadecimal",
  "log": false,
  "numbersToExpressions": true,
  "renameGlobals": false,
  "rotateStringArray": true,
  "selfDefending": true,
  "shuffleStringArray": true,
  "splitStrings": true,
  "splitStringsChunkLength": 10,
  "stringArray": true,
  "stringArrayCallsTransform": true,
  "stringArrayCallsTransformThreshold": 0.75,
  "stringArrayEncoding": ["base64"],
  "stringArrayIndexShift": true,
  "stringArrayRotate": true,
  "stringArrayShuffle": true,
  "stringArrayWrappersCount": 2,
  "stringArrayWrappersChainedCalls": true,
  "stringArrayWrappersParametersMaxCount": 4,
  "stringArrayWrappersType": "function",
  "stringArrayThreshold": 0.75,
  "transformObjectKeys": true,
  "unicodeEscapeSequence": false
}
```

## Примеры защиты

### HTML с защитами
```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Защищенный сайт</title>
    <link rel="stylesheet" href="../css/protection.css">
</head>
<body class="nocopy">
    <h1>Контент сайта</h1>
    <script src="../js/protection.js"></script>
    <script>
        // Ваш код здесь
        console.log('Привет, мир!');
    </script>
</body>
</html>
```

### CSS защиты
```css
/* Запрет выделения */
.nocopy, body {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* Защита от печати */
@media print {
  * {
    display: none !important;
  }
}

/* Скрытие outline */
a:focus {
  outline: none;
}
```

### JavaScript защиты
```javascript
// Блокировка контекстного меню
document.addEventListener('contextmenu', e => e.preventDefault());

// Блокировка горячих клавиш
document.addEventListener('keydown', e => {
  if (e.key === 'F12' || 
      (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) ||
      (e.ctrlKey && e.key.toLowerCase() === 'u')) {
    e.preventDefault();
  }
});

// Детектор DevTools
const devtoolsDetector = () => {
  const t0 = performance.now();
  console.log(new Error());
  const dt = performance.now() - t0;
  
  if (dt > 100) {
    document.body.innerHTML = 'DevTools заблокированы!';
  }
};

setInterval(devtoolsDetector, 2000);
```

## Продвинутые примеры

### Многостраничный сайт
```
src/
├── html/
│   ├── index.html
│   ├── about.html
│   └── contact.html
├── css/
│   ├── main.css
│   ├── about.css
│   └── contact.css
├── js/
│   ├── main.js
│   ├── about.js
│   └── contact.js
└── assets/
    ├── images/
    └── fonts/
```

### SPA приложение
```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>SPA App</title>
    <link rel="stylesheet" href="../css/app.css">
</head>
<body>
    <div id="app"></div>
    <script src="../js/app.js"></script>
    <script>
        // Инициализация SPA
        window.__obfuscator = window.__obfuscator || {};
        window.__obfuscator.__initialized = true;
    </script>
</body>
</html>
```

### С кастомными настройками
```javascript
// custom-build.js
import { build } from 'obf-minify-build';
import fs from 'fs';

// Читаем кастомную конфигурацию
const customConfig = JSON.parse(fs.readFileSync('custom-obfuscator.json', 'utf8'));

build({
  src: 'src',
  out: 'dist',
  make: false,
  obfuscatorConfig: customConfig
});
```

## CI/CD интеграция

### GitHub Actions
```yaml
name: Build and Deploy
on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '18'
    - run: npm install
    - run: npm run build
    - uses: actions/upload-artifact@v2
      with:
        name: dist
        path: dist/
```

### Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

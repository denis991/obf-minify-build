# Testing Guide

## Полное тестирование функционала

### 1. Базовые команды

```bash
# Тест 1: Базовая сборка (Makefile)
npx obf-minify-build

# Проверка результата
ls -la build/
# Должны быть: css/, html/, js/, assets/, resources/
```

### 2. Пользовательские пути

```bash
# Тест 2: Пользовательские папки
npx obf-minify-build --src src --out dist

# Проверка результата
ls -la dist/
# Должны быть те же папки, что и в build/
```

### 3. Node.js сборка

```bash
# Тест 3: Node.js сборка
npx obf-minify-build --no-make

# Проверка результата
ls -la build/
# Должны быть те же папки
```

### 4. Комбинированные параметры

```bash
# Тест 4: Node.js сборка с пользовательскими путями
npx obf-minify-build --src src --out test-custom --no-make

# Проверка результата
ls -la test-custom/
```

### 5. Справка

```bash
# Тест 5: Справка
npx obf-minify-build --help
# Должна показать справку с примерами
```

## Проверка функционала

### Минификация

```bash
# Проверка минификации CSS
cat build/css/protection.*.css
# Должен быть минифицирован (без пробелов, переносов)

# Проверка минификации HTML
cat build/html/index.html
# Должен быть минифицирован
```

### Обфускация

```bash
# Проверка обфускации JS
cat build/js/protection.*.js
# Должен быть обфусцирован (нечитаемый код)

# Проверка обфускации inline-скриптов
grep -o "function _0x[a-f0-9]*" build/html/index.html
# Должны быть обфусцированные функции
```

### Хеширование

```bash
# Проверка хеширования файлов
ls build/css/ build/js/
# Файлы должны иметь хеши в именах

# Проверка обновления ссылок
grep -o "protection\.[a-f0-9]*" build/html/index.html
# Ссылки должны указывать на хешированные файлы
```

## Автоматическое тестирование

### Скрипт тестирования

```bash
#!/bin/bash
# test-all.sh

echo "🧪 Тестирование obf-minify-build..."

# Очистка
rm -rf build dist test-custom

echo "✅ Тест 1: Базовая сборка"
npx obf-minify-build
if [ $? -eq 0 ]; then
    echo "✅ Базовая сборка прошла успешно"
else
    echo "❌ Базовая сборка не удалась"
    exit 1
fi

echo "✅ Тест 2: Пользовательские пути"
npx obf-minify-build --src src --out dist
if [ $? -eq 0 ]; then
    echo "✅ Пользовательские пути работают"
else
    echo "❌ Пользовательские пути не работают"
    exit 1
fi

echo "✅ Тест 3: Node.js сборка"
npx obf-minify-build --no-make
if [ $? -eq 0 ]; then
    echo "✅ Node.js сборка работает"
else
    echo "❌ Node.js сборка не работает"
    exit 1
fi

echo "✅ Тест 4: Комбинированные параметры"
npx obf-minify-build --src src --out test-custom --no-make
if [ $? -eq 0 ]; then
    echo "✅ Комбинированные параметры работают"
else
    echo "❌ Комбинированные параметры не работают"
    exit 1
fi

echo "✅ Тест 5: Справка"
npx obf-minify-build --help > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Справка работает"
else
    echo "❌ Справка не работает"
    exit 1
fi

echo "🎉 Все тесты прошли успешно!"
```

### Запуск тестов

```bash
# Сделать скрипт исполняемым
chmod +x test-all.sh

# Запустить тесты
./test-all.sh
```

## Проверка качества сборки

### Размер файлов

```bash
# Проверка размера исходных файлов
du -sh src/

# Проверка размера собранных файлов
du -sh build/

# Сравнение размеров
echo "Исходники: $(du -sh src/ | cut -f1)"
echo "Сборка: $(du -sh build/ | cut -f1)"
```

### Производительность

```bash
# Измерение времени сборки
time npx obf-minify-build

# Измерение времени Node.js сборки
time npx obf-minify-build --no-make
```

### Валидация HTML

```bash
# Проверка валидности HTML (если установлен html-validate)
npx html-validate build/html/*.html

# Или с помощью w3c-validator
npx w3c-html-validator build/html/*.html
```

## Отладка проблем

### Включение отладочной информации

```bash
# Подробные логи Makefile
make all VERBOSE=1

# Отладка Node.js
DEBUG=* npx obf-minify-build --no-make
```

### Проверка конфигурации

```bash
# Проверка obfuscator.json
cat obfuscator.json | jq .

# Проверка config.mk
cat config.mk

# Проверка package.json
cat package.json | jq .scripts
```

### Проверка зависимостей

```bash
# Проверка установленных пакетов
npm list

# Проверка версий
node --version
npm --version
make --version
```

## CI/CD тестирование

### GitHub Actions

```yaml
name: Test Build
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '18'
    - run: npm install
    - run: npx obf-minify-build
    - run: npx obf-minify-build --src src --out dist
    - run: npx obf-minify-build --no-make
    - run: npx obf-minify-build --help
    - name: Check build output
      run: |
        ls -la build/
        ls -la dist/
        test -f build/html/index.html
        test -f build/css/protection.*.css
        test -f build/js/protection.*.js
```

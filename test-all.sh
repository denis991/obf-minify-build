#!/bin/bash
# test-all.sh - Полное тестирование obf-minify-build

set -e  # Остановить при первой ошибке

echo "🧪 Тестирование obf-minify-build..."

# Очистка
echo "🧹 Очистка предыдущих сборок..."
rm -rf build dist test-custom

# Тест 1: Базовая сборка (Makefile)
echo ""
echo "✅ Тест 1: Базовая сборка (Makefile)"
npx obf-minify-build
if [ $? -eq 0 ]; then
    echo "✅ Базовая сборка прошла успешно"
    if [ -d "build" ] && [ -f "build/html/index.html" ]; then
        echo "✅ Структура build/ корректна"
    else
        echo "❌ Структура build/ некорректна"
        exit 1
    fi
else
    echo "❌ Базовая сборка не удалась"
    exit 1
fi

# Тест 2: Пользовательские пути
echo ""
echo "✅ Тест 2: Пользовательские пути"
npx obf-minify-build --src src --out dist
if [ $? -eq 0 ]; then
    echo "✅ Пользовательские пути работают"
    if [ -d "dist" ] && [ -f "dist/html/index.html" ]; then
        echo "✅ Структура dist/ корректна"
    else
        echo "❌ Структура dist/ некорректна"
        exit 1
    fi
else
    echo "❌ Пользовательские пути не работают"
    exit 1
fi

# Тест 3: Node.js сборка
echo ""
echo "✅ Тест 3: Node.js сборка"
npx obf-minify-build --no-make
if [ $? -eq 0 ]; then
    echo "✅ Node.js сборка работает"
else
    echo "❌ Node.js сборка не работает"
    exit 1
fi

# Тест 4: Комбинированные параметры
echo ""
echo "✅ Тест 4: Комбинированные параметры"
npx obf-minify-build --src src --out test-custom --no-make
if [ $? -eq 0 ]; then
    echo "✅ Комбинированные параметры работают"
    if [ -d "test-custom" ] && [ -f "test-custom/html/index.html" ]; then
        echo "✅ Структура test-custom/ корректна"
    else
        echo "❌ Структура test-custom/ некорректна"
        exit 1
    fi
else
    echo "❌ Комбинированные параметры не работают"
    exit 1
fi

# Тест 5: Справка
echo ""
echo "✅ Тест 5: Справка"
npx obf-minify-build --help > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Справка работает"
else
    echo "❌ Справка не работает"
    exit 1
fi

# Проверка функционала
echo ""
echo "🔍 Проверка функционала..."

# Проверка минификации
echo "  - Проверка минификации CSS..."
if grep -q "user-select:none" build/css/protection.*.css; then
    echo "  ✅ CSS минифицирован"
else
    echo "  ❌ CSS не минифицирован"
    exit 1
fi

# Проверка обфускации
echo "  - Проверка обфускации JS..."
if grep -q "function _0x" build/js/protection.*.js; then
    echo "  ✅ JS обфусцирован"
else
    echo "  ❌ JS не обфусцирован"
    exit 1
fi

# Проверка хеширования
echo "  - Проверка хеширования файлов..."
if ls build/css/protection.*.css | grep -q "\."; then
    echo "  ✅ CSS файлы хешированы"
else
    echo "  ❌ CSS файлы не хешированы"
    exit 1
fi

if ls build/js/protection.*.js | grep -q "\."; then
    echo "  ✅ JS файлы хешированы"
else
    echo "  ❌ JS файлы не хешированы"
    exit 1
fi

# Проверка обновления ссылок
echo "  - Проверка обновления ссылок..."
if grep -q "protection\.[a-f0-9]*" build/html/index.html; then
    echo "  ✅ Ссылки обновлены"
else
    echo "  ❌ Ссылки не обновлены"
    exit 1
fi

# Статистика
echo ""
echo "📊 Статистика сборки:"
echo "  Исходники: $(du -sh src/ | cut -f1)"
echo "  Сборка: $(du -sh build/ | cut -f1)"
echo "  Файлов в src/: $(find src/ -type f | wc -l)"
echo "  Файлов в build/: $(find build/ -type f | wc -l)"

echo ""
echo "🎉 Все тесты прошли успешно!"
echo "✅ obf-minify-build работает корректно"

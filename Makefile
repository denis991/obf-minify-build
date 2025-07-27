include config.mk

.PHONY: all clean build minify-css minify-html obfuscate-js obfuscate-html-inline hash-assets lint
all: clean build minify-css minify-html obfuscate-js obfuscate-html-inline hash-assets
	@echo "🎉 Сборка завершена. Файлы в $(BUILD_DIR)/"

clean:
	rm -rf $(BUILD_DIR)

build:
	@echo "📦 Поиск и копирование исходников..."
	@mkdir -p $(BUILD_DIR)
	# Находим все файлы в SRC_DIR и копируем их в BUILD_DIR, сохраняя структуру папок
	@cd $(SRC_DIR) && find . -type f \
		-name "*.html" -o \
		-name "*.css" -o \
		-name "*.js" -o \
		-name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.svg" -o -name "*.webp" \
		| cpio -pdm ../$(BUILD_DIR)

minify-css:
	@echo "🧼 Минификация CSS..."
	@find $(BUILD_DIR) -type f -name '*.css' $(foreach f,$(IGNORE_CSS),-not -name $(f)) \
		-print | while read file; do \
		npx clean-css-cli -o $$file $$file; \
		echo "✔ Мин.: $$file"; \
	done

minify-html:
	@echo "🧼 Минификация HTML..."
	@find $(BUILD_DIR) -type f -name '*.html' $(foreach f,$(IGNORE_HTML),-not -name $(f)) \
		-print | while read file; do \
		$(HTMLMIN) $$file -o $$file $(HTML_MIN_OPTS); \
		echo "✔ Мин.: $$file"; \
	done

obfuscate-js:
	@echo "🔐 Обфускация JS-файлов..."
	@find $(BUILD_DIR) -type f -name '*.js' $(foreach f,$(IGNORE_JS),-not -name $(f)) \
		-print | while read file; do \
		$(JSOBF) $$file --output $$file --config obfuscator.json; \
		echo "✔ Обф.: $$file"; \
	done

obfuscate-html-inline:
	@echo "🔍 Обфускация inline-скриптов в HTML..."
	node scripts/obfuscate-html-inline.js $(BUILD_DIR)

hash-assets:
	@echo "🔗 Хеширование ассетов и обновление ссылок..."
	node scripts/hash-assets.js $(BUILD_DIR)

lint:
	npx eslint src/js && npx stylelint "src/css/**/*.css" && npx htmlhint src/html

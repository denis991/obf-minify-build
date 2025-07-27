# === Пути ===
SRC_DIR     := src
BUILD_DIR   := build
#HTML_SRC    := $(SRC_DIR)/html
#CSS_SRC     := $(SRC_DIR)/css
#JS_SRC      := $(SRC_DIR)/js

# === Инструменты ===
HTMLMIN     := npx html-minifier-terser
JSOBF       := npx javascript-obfuscator

# === Опции минификации HTML ===
HTML_MIN_OPTS := \
--collapse-whitespace \
--remove-comments \
--remove-redundant-attributes \
--remove-empty-attributes \
--minify-css true \
--minify-js false  # JS обфусцируем отдельно

# === Опции обфускации JS ===
JS_OBF_OPTS := \
--compact true \
--control-flow-flattening true \
--control-flow-flattening-threshold 0.75 \
--numbers-to-expressions true \
--simplify true \
--string-array true \
--string-array-threshold 1 \
--rotate-string-array true

# === Игнорируемые файлы ===
IGNORE_JS    := protection.js vendor.js
IGNORE_CSS   := reset.css vendor.css
IGNORE_HTML  := ignore-this.html

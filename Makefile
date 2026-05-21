SASS = ./node_modules/.bin/sass
ES_BUILD = node scripts/bundle.mjs
TS_LINT = ./node_modules/.bin/tslint
TAPE = ./node_modules/tape/bin/tape
FAUCET = ./node_modules/.bin/faucet
TAP_DOT = ./node_modules/.bin/tap-dot
NYC = ./node_modules/.bin/nyc
CODECOV = ./node_modules/.bin/codecov
SANE = ./node_modules/.bin/sane
CONCURRENTLY = ./node_modules/.bin/concurrently

TS_ENTRY_POINT := ts/main.ts
BUNDLE_TARGET := public/assets/javascript/party.js

TS_SOURCES := ts/**.ts ts/**.tsx
TS_TEST_SOURCES := 'ts/test/**/*.spec.ts'
TS_TEST_SOURCES_DIR := ts/test

all: build

bootstrap: node_modules
.PHONY: bootstrap

node_modules:
	@npm install

build: bootstrap css js
.PHONY: build

build-dev: bootstrap css js-dev
.PHONY: build-dev

css:
	@mkdir -p ./public/assets/stylesheets
	@${SASS} ./scss/party.scss --style=compressed > ./public/assets/stylesheets/party.min.css
.PHONY: css

js:
	@echo "Building chances-party browser client..."
	@echo "Entry point: ${TS_ENTRY_POINT}"
	@echo "Bundle target: ${BUNDLE_TARGET}"
	@${ES_BUILD}
.PHONY: js

js-dev:
	@echo "Building chances-party browser client..."
	@echo "Entry point: ${TS_ENTRY_POINT}"
	@echo "Bundle target: ${BUNDLE_TARGET}"
	@NODE_ENV=development ${ES_BUILD}
.PHONY: js-dev

lint:
	@${TS_LINT} -c tslint.json ${TS_SOURCES}
.PHONY: lint

test: lint
	@npm run test:ts --silent
.PHONY: test

cover:
	@rm -rf coverage
	@npx tsc
	@${NYC} ${TAPE} ${TS_TEST_SOURCES} | ${FAUCET}
	@xdg-open coverage/index.html 2> /dev/null || open coverage/index.html
.PHONY: cover

test-ci: lint
	@rm -rf coverage
	@npx tsc
	@${NYC} ${TAPE} ${TS_TEST_SOURCES} | ${TAP_DOT}
	@${CODECOV} -f coverage/*.json -t 3a8a22dc-d6c4-4c57-b7e8-edfa34ea9b85
.PHONY: test-ci

watch:
	@echo "Entry point: ${TS_ENTRY_POINT}"
	@echo "Bundle target: ${BUNDLE_TARGET}"
	@make --quiet clean
	@${CONCURRENTLY} -n "js,sass,sync" -c "red,magenta,gray" --group --kill-others \
		"make --quiet watch-js" \
		"make --quiet watch-scss" \
		"make --quiet browser-sync"
.PHONY: watch

browser-sync:
	npx browser-sync start -s public -f public --open ui
.PHONY: browser-sync

watch-scss:
	@${SANE} "make --quiet css" scss --wait=2
.PHONY: watch-scss

watch-js:
	@NODE_ENV=development WATCH='' ${ES_BUILD}
.PHONY: watch-js

watch-tests:
	@make test
	@fswatch -or --latency=2 ${TS_TEST_SOURCES_DIR} | xargs -n1 -I {} \
	make test
.PHONY: watch-tests

clean:
	rm -f public/index.html
	rm -f ${BUNDLE_TARGET}
.PHONY: clean

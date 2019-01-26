TSC = ./node_modules/.bin/tsc
FUSE = node fuse.js
PARCEL = npx parcel
BROWSER_SYNC = ./node_modules/.bin/browser-sync
TS_LINT = ./node_modules/.bin/tslint
TAPE = ./node_modules/.bin/tape
FAUCET = ./node_modules/.bin/faucet
TAP_DOT = ./node_modules/.bin/tap-dot
NYC = ./node_modules/.bin/nyc
CODECOV = ./node_modules/.bin/codecov
SANE = ./node_modules/.bin/sane
CONCURRENTLY = ./node_modules/.bin/concurrently

TS_ENTRY_POINT := ./ts/main.ts
FUSE_TARGET := ../../site/assets/javascript/party.js

TS_SOURCES := ./ts/**.ts ./ts/**.tsx
TS_TEST_SOURCES := './ts/test/**/*.spec.ts'
TS_TEST_SOURCES_DIR := ./ts/test

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
	@cp -r scss/* ../assets/scss/.
.PHONY: css

js:
	@echo "Building chances-party browser client..."
	@echo "Entry point: ${TS_ENTRY_POINT}"
	@echo "Bundle target: ${FUSE_TARGET}"
	@${FUSE}
.PHONY: js

js-dev:
	@echo "Building chances-party browser client..."
	@echo "Entry point: ${TS_ENTRY_POINT}"
	@echo "Bundle target: ${FUSE_TARGET}"
	@NODE_ENV=development ${FUSE}
.PHONY: js-dev

lint:
	@${TS_LINT} -c ./tslint.json ${TS_SOURCES}
.PHONY: lint

test: lint
	@npm run test:ts --silent
.PHONY: test

cover:
	@rm -rf coverage
	@${NYC} ${TAPE} './ts/test/**/*.spec.ts' | ${FAUCET}
	@xdg-open ./coverage/index.html
.PHONY: cover

test-ci: lint
	@rm -rf coverage
	@${TSC}
	@${NYC} ${TAPE} './ts/test/**/*.spec.ts' | ${TAP_DOT}
	@${CODECOV} -f ./coverage/*.json -t 3a8a22dc-d6c4-4c57-b7e8-edfa34ea9b85
.PHONY: test-ci

watch:
	@echo "Entry point: ${TS_ENTRY_POINT}"
	@echo "Bundle target: ${FUSE_TARGET}"
	@make --quiet clean
	@${CONCURRENTLY} -n "css,sass,js" -c "gray.dim,magenta,red" --kill-others \
		"cd ../..; make --quiet watch-css &> /dev/null" \
		"make --quiet watch-scss" \
		"make --quiet watch-js"
.PHONY: watch

browser-sync:
	@${BROWSER_SYNC} start -s "../../site" -f "../../site" --open "ui" --startPath "/party"
.PHONY: browser-sync

watch-scss:
	@${SANE} "cp -r scss/* ../assets/scss/. && cd ../..; make --quiet css" ./scss --wait=2
.PHONY: watch-scss

watch-js:
	NODE_ENV=development WATCH='' ${FUSE}
.PHONY: watch-js

watch-tests:
	@make test
	@fswatch -or --latency=2 ${TS_TEST_SOURCES_DIR} | xargs -n1 -I {} \
	make test
.PHONY: watch-tests

clean:
	rm -f ${FUSE_TARGET}
.PHONY: clean

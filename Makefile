TSC = ./node_modules/.bin/tsc
WEBPACK = ./node_modules/.bin/webpack
BROWSER_SYNC = ./node_modules/.bin/browser-sync
TS_LINT = ./node_modules/.bin/tslint
TS_NODE = ./node_modules/.bin/ts-node
TAPE = ./node_modules/.bin/tape
FAUCET = ./node_modules/.bin/faucet
TAP_DOT = ./node_modules/.bin/tap-dot
NYC = ./node_modules/.bin/nyc
CODECOV = ./node_modules/.bin/codecov
SANE = ./node_modules/.bin/sane
CONCURRENTLY = ./node_modules/.bin/concurrently

TS_ENTRY_POINT := ./ts/main.ts
JS_ENTRY_POINT := ./js/main.js
WEBPACK_TARGET := ../assets/javascript/party.js

TS_SOURCES := ./ts/**.ts ./ts/**.tsx
TS_TEST_SOURCES := ./ts/test/*.ts
JS_TEST_SOURCES := ./js/test/*.js

all: build

build: css js
.PHONY: build

css:
	@cp -r scss/* ../assets/scss/.
.PHONY: css

js:
	@echo "Building chances-party browser client..."
	@echo "Entry point: ${TS_ENTRY_POINT}"
	@echo "Webpack target: ${WEBPACK_TARGET}"
	@NODE_ENV=production ${WEBPACK} --config webpack.prod.js
.PHONY: js

lint:
	@${TS_LINT} -c ./tslint.json ${TS_SOURCES}
.PHONY: lint

test: lint
	@${TS_NODE} --fast ${TAPE} ${TS_TEST_SOURCES} | ${FAUCET}
.PHONY: test

cover:
	@rm -rf coverage
	@${NYC} ${TAPE} ${TS_TEST_SOURCES} | ${FAUCET}
	@xdg-open ./coverage/index.html
.PHONY: cover

test-ci: lint
	@rm -rf coverage
	@${TSC}
	@${NYC} ${TAPE} ${JS_TEST_SOURCES} | ${TAP_DOT}
	@${CODECOV} -f ./coverage/*.json -t 3a8a22dc-d6c4-4c57-b7e8-edfa34ea9b85
.PHONY: test-ci

watch:
	@echo "Entry point: ${TS_ENTRY_POINT}"
	@echo "Browserify target: ${WEBPACK_TARGET}"
	@${CONCURRENTLY} --kill-others \
		"cd ../..; make --quiet watch &> /dev/null" \
		"make --quiet browser-sync &> /dev/null" \
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
	@${WEBPACK} --config webpack.dev.js --watch
.PHONY: watch-js

watch-tests: test
	@${SANE} "${TS_NODE} --fast ${TAPE} ${TS_TEST_SOURCES} | ${FAUCET}" ./ts/test --wait=2
.PHONY: watch-tests

clean:
	rm -rf ./js
	rm -f ${WEBPACK_TARGET}
.PHONY: clean

TSC = ./node_modules/.bin/tsc
PARCEL = npx parcel
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
PARCEL_TARGET := ../assets/javascript/party.js
PARCEL_TARGET_MAP := ../assets/javascript/party.map
PARCEL_TARGET_FILE := party.js

TS_SOURCES := ./ts/**.ts ./ts/**.tsx
TS_TEST_SOURCES := "./ts/test/**/*.spec.ts"

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
	@echo "Parcel target: ${PARCEL_TARGET}"
	@${PARCEL} build ${TS_ENTRY_POINT} -d ../assets/javascript --out-file party.js --no-source-maps
.PHONY: js

js-dev:
	@echo "Building chances-party browser client..."
	@echo "Entry point: ${TS_ENTRY_POINT}"
	@echo "Parcel target: ${PARCEL_TARGET}"
	@NODE_ENV=development ${PARCEL} build ${TS_ENTRY_POINT} -d ../assets/javascript --out-file party.js --no-minify
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
	@echo "Parcel target: ${PARCEL_TARGET}"
	@make --quiet clean
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
	${PARCEL} watch ${TS_ENTRY_POINT} -d ../assets/javascript --out-file party.js --log-level 2
.PHONY: watch-js

watch-tests:
	@${SANE} "make test" --glob '**/*.spec.ts' --wait=2
.PHONY: watch-tests

clean:
	rm -rf ./js
	rm -f ${PARCEL_TARGET}
	rm -f ${PARCEL_TARGET_MAP}
.PHONY: clean

PROTOBUF_VERSION = 3.19.1
PROTOC ?= protoc
UNAME := $(shell uname)
PROTO_FILES := $(wildcard src/*.proto)
export PATH := node_modules/.bin:/usr/local/include/:protoc3/bin:$(PATH)

ifneq ($(CI), true)
LOCAL_ARG = --local --verbose --diagnostics
endif

ifeq ($(UNAME),Darwin)
PROTOBUF_ZIP = protoc-$(PROTOBUF_VERSION)-osx-x86_64.zip
else
PROTOBUF_ZIP = protoc-$(PROTOBUF_VERSION)-linux-x86_64.zip
endif

install_compiler:
	@# remove local folder
	rm -rf protoc3 || true

	@# Make sure you grab the latest version
	curl -OL https://github.com/protocolbuffers/protobuf/releases/download/v$(PROTOBUF_VERSION)/$(PROTOBUF_ZIP)

	@# Unzip
	unzip $(PROTOBUF_ZIP) -d protoc3
	@# delete the files
	rm $(PROTOBUF_ZIP)

	@# move protoc to /usr/local/bin/
	chmod +x protoc3/bin/protoc

install: install_compiler
	npm install
	npm i -S google-protobuf@$(PROTOBUF_VERSION)
	npm i -S @types/google-protobuf@latest

test: build
	${PROTOC} \
		"--plugin=protoc-gen-dclunity=./dist/index.js" \
		"-I=$(PWD)/test/codegen" \
		"--dclunity_out=$(PWD)/test/codegen" \
		"--csharp_out=$(PWD)/test/codegen" \
		"--csharp_opt=file_extension=.gen.cs" \
		"$(PWD)/test/codegen/api.proto"
	node_modules/.bin/jest --detectOpenHandles --colors --runInBand $(TESTARGS) --coverage

test-watch:
	node_modules/.bin/jest --detectOpenHandles --colors --runInBand --watch $(TESTARGS) --coverage

build:
	@rm -rf dist || true
	@mkdir -p dist
	cp -r bin/* dist/
	@NODE_ENV=production node_modules/.bin/ncc build src/bin.ts
	chmod +x ./dist/index.js

dist:
	@NODE_ENV=production node_modules/.bin/ncc build src/bin.ts

.PHONY: build test codegen

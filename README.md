# protoc-gen-csharp

```bash
protoc \
  -I=$(pwd)/protos \
  --js_out=import_style=commonjs,binary:$(pwd)/protos \
  --dcl_out=$(pwd)/protos \
  # ^^^^^^^^^^^^^^^^^^^^^   this will do the trick
  $(pwd)/protos/index.proto
```
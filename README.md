# protoc-gen-dclunity

```bash
protoc \
  -I=$(pwd)/protos \
  --dclunity_out=$(pwd)/protos \
  # ^^^^^^^^^^^^^^^^^^^^^   this will do the trick
  $(pwd)/protos/index.proto
```
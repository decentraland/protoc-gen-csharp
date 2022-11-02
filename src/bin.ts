#!/usr/bin/env node

import { printFileDescriptorTSD } from "ts-protoc-gen/lib/ts/fileDescriptorTSD"
import { ExportMap } from "ts-protoc-gen/lib/ExportMap"
import { replaceProtoSuffix, withAllStdIn, getParameterEnums, throwError } from "ts-protoc-gen/lib/util"
import { CodeGeneratorRequest, CodeGeneratorResponse } from "google-protobuf/google/protobuf/compiler/plugin_pb"
import { FileDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb"
//import { generateDclRpcService } from "./codegen/client"
import { generateServerRpcService } from "./codegen/server"
import { generateDclRpcService } from "./codegen/client"

function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * This is the ProtoC compiler plugin.
 *
 * The Protocol Buffers Compiler can be extended to [support new languages via plugins](https://developers.google.com/protocol-buffers/docs/reference/other).
 * A plugin is just a program which reads a CodeGeneratorRequest protocol buffer from standard input
 * and then writes a CodeGeneratorResponse protocol buffer to standard output.
 * These message types are defined in [plugin.proto](https://github.com/google/protobuf/blob/master/src/google/protobuf/compiler/plugin.proto).
 *
 */
withAllStdIn((inputBuff: Buffer) => {
  try {
    const typedInputBuff = new Uint8Array(inputBuff.length)
    typedInputBuff.set(inputBuff)

    const codeGenRequest = CodeGeneratorRequest.deserializeBinary(typedInputBuff)
    const codeGenResponse = new CodeGeneratorResponse()
    codeGenResponse.setSupportedFeatures(CodeGeneratorResponse.Feature.FEATURE_PROTO3_OPTIONAL)
    const exportMap = new ExportMap()
    const fileNameToDescriptor: { [key: string]: FileDescriptorProto } = {}

    // const parameter = codeGenRequest.getParameter()

    codeGenRequest.getProtoFileList().forEach((protoFileDescriptor) => {
      const fileDescriptorName = protoFileDescriptor.getName() || throwError("Missing file descriptor name")
      fileNameToDescriptor[fileDescriptorName] = protoFileDescriptor
      exportMap.addFileDescriptor(protoFileDescriptor)
    })

    codeGenRequest.getFileToGenerateList().forEach((fileName) => {
      const outputFileName = capitalizeFirstLetter(fileName.replace('.proto', ''))

      generateDclRpcService(outputFileName, fileNameToDescriptor[fileName], exportMap)?.forEach((file) =>
        codeGenResponse.addFile(file)
      )

      generateServerRpcService(outputFileName, fileNameToDescriptor[fileName], exportMap)?.forEach((file) =>
        codeGenResponse.addFile(file)
      )
    })

    process.stdout.write(Buffer.from(codeGenResponse.serializeBinary().buffer))
  } catch (err: any) {
    console.error("protoc-gen-ts error: " + err.stack + "\n")
    process.exit(1)
  }
})

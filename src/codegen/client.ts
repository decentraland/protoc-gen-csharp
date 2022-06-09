// TODO: Implement client for C#

/*import { ExportMap } from "ts-protoc-gen/lib/ExportMap"
import { Printer } from "ts-protoc-gen/lib/Printer"
import { CodePrinter } from "ts-protoc-gen/lib/CodePrinter"
import { FileDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb"
import { CodeGeneratorResponse } from "google-protobuf/google/protobuf/compiler/plugin_pb"
import { createFile, RPCMethodDescriptor, RPCDescriptor, GrpcServiceDescriptor } from "ts-protoc-gen/lib/service/common"
import { printRpcDescriptor } from "./shared"

export function generateDclRpcService(
  filename: string,
  descriptor: FileDescriptorProto,
  exportMap: ExportMap
): CodeGeneratorResponse.File[] {
  return [createFile(generateClientTypeScriptDefinition(descriptor, exportMap), `${filename}_client.ts`)]
}

function generateClientTypeScriptDefinition(fileDescriptor: FileDescriptorProto, exportMap: ExportMap): string {
  const serviceDescriptor = new GrpcServiceDescriptor(fileDescriptor, exportMap)
  const printer = new Printer(0)

  // Header.
  printer.printLn(`// package: ${serviceDescriptor.packageName}`)
  printer.printLn(`// file: ${serviceDescriptor.filename}`)
  printer.printEmptyLn()

  if (serviceDescriptor.services.length === 0) {
    return printer.getOutput()
  }

  // Import statements.
  serviceDescriptor.imports.forEach((importDescriptor) => {
    printer.printLn(`import * as ${importDescriptor.namespace} from "${importDescriptor.path}";`)
  })
  printer.printLn(`import { RpcClientPort } from "@dcl/rpc";`)
  printer.printLn(`import * as codegen from "@dcl/rpc/dist/codegen";`)
  printer.printEmptyLn()

  // Services.
  serviceDescriptor.services.forEach((service) => {
    printRpcDescriptor(service, printer)

    printer.printLn(`export function load${service.name}(port: RpcClientPort): ${service.name} {`)

    printer.printLn(`  const portFuture = port.loadModule(${JSON.stringify(service.name)});`)

    printer.printLn(`  return {`)

    service.methods.forEach((method) => {
      let fun = method.responseStream ? "codegen.clientProcedureStream" : "codegen.clientProcedureUnary"

      printer.printIndentedLn(
        `  ${JSON.stringify(method.nameAsPascalCase)}: ${fun}(portFuture, ${JSON.stringify(method.nameAsPascalCase)}, ${
          method.requestType
        }, ${method.responseType}),`
      )
    })
    printer.printLn(`  }`)

    printer.printLn(`}`)
    printer.printEmptyLn()
  })

  return printer.getOutput()
}
*/
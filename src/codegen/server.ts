import { ExportMap } from "ts-protoc-gen/lib/ExportMap"
import { Printer } from "ts-protoc-gen/lib/Printer"
import { FileDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb"
import { CodeGeneratorResponse } from "google-protobuf/google/protobuf/compiler/plugin_pb"
import { createFile, GrpcServiceDescriptor, ImportDescriptor } from "ts-protoc-gen/lib/service/common"

export function generateServerRpcService(
  filename: string,
  descriptor: FileDescriptorProto,
  exportMap: ExportMap
): CodeGeneratorResponse.File[] | null {
  const code = generateServerTypeScriptDefinition(descriptor, exportMap)
  if (code == null)
    return null

    return [createFile(code, `${filename}Service.gen.cs`)]
}

function removePseudoNameFromImportDescriptor(text: string, imports: ImportDescriptor[]) {
  for (let i of imports) {
    text = text.replace(i.namespace + ".", '')
  }
  return text
}

// Converts `Teleport.FromKernel.RequestTeleport`
// to `global::Teleport.Types.FromKernel.Types.RequestTeleport`
function convertTypeToCSharp(typeName: string) {
  const names = typeName.split('.')
  if (names.length > 1) {
    let text = 'global::'
    for (let i = 0; i < names.length; ++i) {
      const name = names[i]
      const first = i == 0
      const last = i == (names.length-1)
      if (!first) text += '.'
      text += name
      if (!last) text += '.Types'
    }
    return text
  } else {
    return typeName
  }
}

function generateServerTypeScriptDefinition(fileDescriptor: FileDescriptorProto, exportMap: ExportMap): string | null {
  const serviceDescriptor = new GrpcServiceDescriptor(fileDescriptor, exportMap)
  if (serviceDescriptor.services.length == 0)
    return null

  const printer = new Printer(0)
  printer.printLn(
`// AUTOGENERATED, DO NOT EDIT
// Type definitions for server implementations of ports.
// package: ${serviceDescriptor.packageName}
// file: ${serviceDescriptor.filename}
using System.Collections.Generic;
using System.Threading;
using Cysharp.Threading.Tasks;
using Google.Protobuf;
using rpc_csharp.protocol;
using rpc_csharp;`)

  const removePseudoName = (text: string) => {
    return removePseudoNameFromImportDescriptor(text, serviceDescriptor.imports)
  }

  if (serviceDescriptor.services.length === 0) {
    return printer.getOutput()
  }

  if (serviceDescriptor.packageName.length > 0) {
    printer.print(`namespace ${serviceDescriptor.packageName} {`)
  }

  // Services.
  serviceDescriptor.services.forEach((service) => {
    const serviceHeaderPrinter = new Printer(0)
    const methodsPrinter = new Printer(0)
    const registerMethodPrinter = new Printer(0)
    service.methods.forEach((method) => {
      const responseType = convertTypeToCSharp(removePseudoName(method.responseType))
      const requestType = convertTypeToCSharp(removePseudoName(method.requestType))
      const responseTypeEx = method.responseStream ? `IUniTaskAsyncEnumerable<${responseType}>` : `UniTask<${responseType}>`
      const requestTypeEx = method.requestStream ? `IUniTaskAsyncEnumerable<${requestType}>` : requestType
      const requestVarName = method.requestStream ? `streamRequest` : `request`

      serviceHeaderPrinter.print(`, ${method.nameAsPascalCase} ${method.nameAsCamelCase}`)

      methodsPrinter.printEmptyLn()
      methodsPrinter.printIndentedLn(`public delegate ${responseTypeEx} ${method.nameAsPascalCase}(${requestTypeEx} ${requestVarName}, Context context${!method.responseStream? ", CancellationToken ct":""});`)

      if (method.responseStream && method.requestStream) {
        registerMethodPrinter.printLn(`result.bidirectionalStreamDefinition.Add("${method.nameAsPascalCase}", (IUniTaskAsyncEnumerable<ByteString> payload, Context context) => {`)
        registerMethodPrinter.printLn(`  return ProtocolHelpers.SerializeMessageEnumerator<${responseType}>(${method.nameAsCamelCase}(`)
        registerMethodPrinter.printLn(`    ProtocolHelpers.DeserializeMessageEnumerator<${requestType}>(payload, s => ${requestType}.Parser.ParseFrom(s)), context));`)
        registerMethodPrinter.printLn(`});`)
      } else if (method.requestStream) {
        registerMethodPrinter.printLn(`result.clientStreamDefinition.Add("${method.nameAsPascalCase}", async (IUniTaskAsyncEnumerable<ByteString> payload, Context context, CancellationToken ct) => {`)
        registerMethodPrinter.printLn(`  return (await ${method.nameAsCamelCase}(`)
        registerMethodPrinter.printLn(`    ProtocolHelpers.DeserializeMessageEnumerator<${requestType}>(payload, s => ${requestType}.Parser.ParseFrom(s)), context, ct))?.ToByteString();`)
        registerMethodPrinter.printLn(`});`)

      } else if (method.responseStream) {
        registerMethodPrinter.printLn(`    result.serverStreamDefinition.Add("${method.nameAsPascalCase}", (payload, context) => { return ProtocolHelpers.SerializeMessageEnumerator<${responseType}>(${method.nameAsCamelCase}(${requestType}.Parser.ParseFrom(payload), context)); });`)
      } else {
        registerMethodPrinter.printLn(`    result.definition.Add("${method.nameAsPascalCase}", async (payload, context, ct) => { var res = await ${method.nameAsCamelCase}(${requestType}.Parser.ParseFrom(payload), context, ct); return res?.ToByteString(); });`)
      }
    })

    printer.print(`
public abstract class ${service.name}<Context>
{
  public const string ServiceName = "${service.name}";
${methodsPrinter.output}
  public static void RegisterService(RpcServerPort<Context> port${serviceHeaderPrinter.output})
  {
    var result = new ServerModuleDefinition<Context>();
      
${registerMethodPrinter.output}
    port.RegisterModule(ServiceName, (port) => UniTask.FromResult(result));
  }`)
    printer.printEmptyLn()
    printer.printLn(`}`)
  })

  if (serviceDescriptor.packageName.length > 0) {
    printer.printLn(`}`)
  }

  return printer.getOutput()
}

import { Printer } from "ts-protoc-gen/lib/Printer"
import { ImportDescriptor } from "ts-protoc-gen/lib/service/common"

export function removePseudoNameFromImportDescriptor(text: string, imports: ImportDescriptor[]) {
  for (let i of imports) {
    text = text.replace(i.namespace + ".", "")
  }
  return text
}

// Converts `Teleport.FromKernel.RequestTeleport`
// to `global::Teleport.Types.FromKernel.Types.RequestTeleport`
export function convertTypeToCSharp(typeName: string) {
  const names = typeName.split(".")
  if (names.length > 1) {
    let text = "global::"
    for (let i = 0; i < names.length; ++i) {
      const name = names[i]
      const first = i == 0
      const last = i == names.length - 1
      if (!first) text += "."
      text += name
      if (!last) text += ".Types"
    }
    return text
  } else {
    return typeName
  }
}

export function capitalizeFirstLetter(text: string) {
  if (text.length >= 2) return text.charAt(0).toUpperCase() + text.slice(1)
  else return text
}

export function snakeCaseToPascalCase(text: string) {
  return text
    .split("_")
    .reduce((res, word, i) => (i === 0 ? capitalizeFirstLetter(word) : `${res}${capitalizeFirstLetter(word)}`), "")
}

export function printCSharpImports(printer: Printer, imports: ImportDescriptor[]) {
  imports.forEach((e) => {
    if (e.namespace === "google_protobuf_empty_pb") {
      printer.printLn(`using Google.Protobuf.WellKnownTypes;`)
    }
  })
}

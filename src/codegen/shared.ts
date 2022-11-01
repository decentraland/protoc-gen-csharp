import { ImportDescriptor } from "ts-protoc-gen/lib/service/common"

export function removePseudoNameFromImportDescriptor(text: string, imports: ImportDescriptor[]) {
    for (let i of imports) {
        text = text.replace(i.namespace + ".", '')
    }
    return text
}

// Converts `Teleport.FromKernel.RequestTeleport`
// to `global::Teleport.Types.FromKernel.Types.RequestTeleport`
export function convertTypeToCSharp(typeName: string) {
    const names = typeName.split('.')
    if (names.length > 1) {
        let text = 'global::'
        for (let i = 0; i < names.length; ++i) {
            const name = names[i]
            const first = i == 0
            const last = i == (names.length - 1)
            if (!first) text += '.'
            text += name
            if (!last) text += '.Types'
        }
        return text
    } else {
        return typeName
    }
}
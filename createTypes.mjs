import jsdoc2md from 'jsdoc-to-markdown'
import fs from 'fs'

/* input and output paths */
const inputFile = './src/allCFunctions.mjs'
const outputDir = './build/package'

/* create output directory if it doesn't exist */
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)

/* get template data */
const templateData = jsdoc2md.getTemplateDataSync({ files: inputFile, configure: './jsdoc.conf' })

function createFunctionString (identifier, returnType, functionName, params) {
  let functionString = '/**' + '\n'
  functionString += `  * ${identifier.description.replace(/\n/g, '\n* ')}` + '\n'
  identifier.params?.forEach((param) => {
    functionString += `  * @param ${param.name} - ${param.description}` + '\n'
  })
  functionString += `  * @returns ${returnType} - ${identifier.returns?.[0]?.description}` + '\n'
  functionString += `  ${identifier.see ? `* @see ${identifier.see[0]}\n` : ''}`
  functionString += '  */' + '\n'
  functionString += `  ${functionName}(${params.join(', ')}): ${returnType};`
  return functionString
}
// Create a TypeScript interface property for each function as a string, in the format
// function(param1: string, param2: number): number;
const allFunctionsTypes = templateData.map((identifier) => {
  if ((identifier.kind === 'member' || identifier.kind === 'function') && identifier.name.includes('GEOS')) {
    const params = identifier.params?.map((param) => {
      return `${param.name}: ${param.type.names[0]}`
    }) || []

    const returnType = identifier.returns?.[0]?.type?.names[0] || 'void'
    // remove geos. from the function name
    const functionName = identifier.name.replace('geos.', '')
    const functionString = createFunctionString(identifier, returnType, functionName, params)
    return functionString
  }
  return ''
}).filter(Boolean)

const allModuleFunctions = templateData.map((identifier) => {
  if (identifier.kind === 'member' && !identifier.name.includes('GEOS')) {
    const params = identifier.params?.map((param) => {
      return `${param.name}: ${param.type.names[0]}`
    }) || []

    const returnType = identifier.returns?.[0]?.type?.names[0] || 'void'
    // remove geos. from the function name
    const functionName = identifier.name.replace('geos.', '')
    const functionString = createFunctionString(identifier, returnType, functionName, params)
    return functionString
  }
  return ''
}).filter(Boolean)

const output = `
interface Module {
  ${allModuleFunctions.join('\n  ')}
}

interface geos {
  ${allFunctionsTypes.join('\n  ')}
  Module: Module;
}

interface Config {
  /** 
    * If autoInit is true, the GEOS library will be initialized when the geos object is created.
    * @default true
  */ 
  autoInit?: boolean;
  errorHandler?: (message: string) => void;
  noticeHandler?: (message: string) => void;
}

declare module 'geos-wasm' {
  export default function initGeosJs(config?: Config): Promise<geos>;
}`

fs.writeFileSync(`${outputDir}/geos.esm.d.ts`, output)

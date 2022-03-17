import { generateUUID } from 'utils'

const tableContent = `
|name|
|----|
||
`
const tableId = generateUUID()
export const DEFAULT_TABLE =
  '```agtable\ntableId: ' + tableId + tableContent + '\n```\n'

import { generateUID } from 'utils'

const tableContent = `
|name|
|----|
||
`
const tableId = generateUID()
export const DEFAULT_TABLE =
  '```agtable\ntableId: ' + tableId + tableContent + '\n```\n'

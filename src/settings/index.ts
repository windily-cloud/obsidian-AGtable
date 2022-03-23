import { generateUID } from 'utils'

const tableContent = `
|name|tags|
|----|----|
|||
`
const tableId = generateUID()
export const DEFAULT_TABLE =
  '```agtable\ntableId: ' + tableId + tableContent + '\n```'

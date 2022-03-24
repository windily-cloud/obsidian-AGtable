import { moment } from 'obsidian'
export function generateUID() {
  return moment().format('YYMMDDhhmmss')
}

export function initTableBySize(tableSize: string) {
  const rowSize = tableSize.split('x')[0].trim()
  const columnSize = tableSize.split('x')[1].trim()
  const header =
    '|' +
    Array(parseInt(columnSize))
      .fill(0)
      .map((el, index) => {
        return `Col${index}`
      })
      .join('|') +
    '|\n'

  const marker =
    '|' +
    Array(parseInt(columnSize))
      .fill(0)
      .map((el, index) => {
        return `----`
      })
      .join('|') +
    '|\n'

  const row = Array(parseInt(rowSize))
    .fill(0)
    .map((el, index) => {
      const rowItem =
        '|' +
        Array(parseInt(columnSize))
          .fill(0)
          .map((el, index) => {
            return ``
          })
          .join('|') +
        '|\n'
      return rowItem
    })
    .join('')
  const tableString =
    `\`\`\`agtable\ntableId: ${generateUID()}\n` + header + marker + row + '```'
  return tableString
}

export function isObjShallowEqual(
  obj1: { [index: string]: string },
  obj2: { [index: string]: string }
) {
  const keys1 = Object.getOwnPropertyNames(obj1)
  const keys2 = Object.getOwnPropertyNames(obj2)
  if (keys1.length !== keys2.length) {
    return false
  }
  const flag = keys1.every((key) => {
    const type = typeof obj1[key]
    if (['function', 'array', 'object'].includes(type)) {
      return type === typeof obj2[key]
    }

    if (obj1[key] !== obj2[key]) {
      return false
    }
    return true
  })
  return flag
}

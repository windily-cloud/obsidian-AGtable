import { ColDef } from 'ag-grid-community'
import { App } from 'obsidian'
interface DataGridTable {
  column: ColDef[]
  row: Array<{ [index: string]: string }>
}

export function generateRandomStr(length: number) {
  let result = ''
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-.~!@#$%^&*()_:<>?'
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

export function generateUUID() {
  var temp_url = URL.createObjectURL(new Blob())
  var uuid = temp_url.toString() // blob:https://xxx.com/b250d159-e1b6-4a87-9002-885d90033be3
  URL.revokeObjectURL(temp_url)
  return uuid.substr(uuid.lastIndexOf('/') + 1)
}

export function markdownTableToDataGrid(
  tableString: string
): DataGridTable | void {
  if (!tableString) {
    return
  }

  const lines = tableString.trim().split('\n')

  if (lines.length < 2) {
    return
  }

  let columnDef = lines[0].split('|')
  columnDef.shift()
  columnDef.pop()

  let column = columnDef.map((el: string) => {
    return {
      field: el,
    }
  })

  let row = lines.slice(2).map((line: string) => {
    const rowList = line.split('|')
    rowList.shift()
    rowList.pop()
    const rowItem = rowList.map((value: string, index: number) => {
      return {
        [columnDef[index]]: value,
      }
    })
    return Object.assign({}, ...rowItem)
  })

  return {
    column,
    row,
  }
}

export function dataGridToMarkdownTable(dataGrid: DataGridTable): string {
  const { column, row } = dataGrid

  let header = '|'
  let marker = '|'
  column.forEach((el) => {
    header += el.field + '|'
    marker += '----|'
  })

  let rowItem = row.map((el) => {
    const rowData = Object.values(el)
    const rowLine = '|' + rowData.join('|') + '|'
    return rowLine
  })

  let rowString = rowItem.join('\n')

  return header + '\n' + marker + '\n' + rowString
}

export async function replaceTable(
  app: App,
  tableId: string,
  tableString: string
) {
  const fileContent = await app.vault.cachedRead(app.workspace.getActiveFile())
  const replaceReg = new RegExp(
    `(?<=tableId:\\s${tableId}\\s)[\\w\\W]*(?=\\W+\`\`\`)`
  )
  const newFileContent = fileContent.replace(replaceReg, tableString)
  app.vault.modify(app.workspace.getActiveFile(), newFileContent)
}

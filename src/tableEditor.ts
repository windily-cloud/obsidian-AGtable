import { ColDef } from 'ag-grid-community'
import { App, MarkdownView, Notice } from 'obsidian'

interface DataGridTable {
  column: ColDef[]
  row: Array<{ [index: string]: string }>
}

export default class TableEditor {
  app: App
  tableId: string
  tablePosition: {
    startIndex: number
    endIndex: number
  }

  constructor(
    app: App,
    tableId: string,
    tablePosition: {
      startIndex: number
      endIndex: number
    }
  ) {
    this.app = app
    this.tableId = tableId
    this.tablePosition = tablePosition
  }

  private isObjShallowEqual(
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

  markdownTableToDataGrid(tableString: string): DataGridTable | void {
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

  dataGridToMarkdownTable(dataGrid: DataGridTable): string {
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

  async replaceMdFileTable(dataGrid: DataGridTable): Promise<void> {
    console.log('dataGrid', dataGrid)
    const tableString = this.dataGridToMarkdownTable(dataGrid)
    console.log(tableString)

    const activeView = this.app.workspace.activeLeaf.view as MarkdownView
    console.log(this.tablePosition)
    const lastLineCh = activeView.editor.getLine(
      this.tablePosition.endIndex
    ).length
    activeView.editor.replaceRange(
      tableString,
      { line: this.tablePosition.startIndex, ch: 0 },
      { line: this.tablePosition.endIndex, ch: lastLineCh }
    )
    // const fileContent = await this.app.vault.cachedRead(
    //   this.app.workspace.getActiveFile()
    // )
    // const replaceReg = new RegExp(
    //   `(?<=tableId:\\s${this.tableId}\\n)(^\\|[^\n]+\\|\\n$)+(?=\\W+\`{3})`
    // )
    // console.log('正则匹配：', fileContent.match(replaceReg))
    // const newFileContent = fileContent.replace(replaceReg, tableString)
    // this.app.vault.modify(this.app.workspace.getActiveFile(), newFileContent)
  }

  //rowData是选中一个cell时一行的数据，rowIndex是选中该行的位置
  changeCellValue(
    dataGrid: DataGridTable,
    rowData: { [key: string]: string },
    rowIndex: number
  ): void {
    const { column, row } = dataGrid

    let newRow = row.map((el, index) => {
      if (index === rowIndex) {
        return rowData
      } else {
        return el
      }
    })

    this.replaceMdFileTable({ column: column, row: newRow })
  }

  dragColumn(
    dataGrid: DataGridTable,
    colId: string,
    toIndex: number
  ): DataGridTable {
    const { column, row } = dataGrid

    //删除该列
    const newColumn = column.filter((el: ColDef) => {
      return el.field != colId
    })
    //将该列插入到列的列表中
    newColumn.splice(toIndex, 0, { field: colId })

    const newRow: Array<{ [key: string]: string }> = []
    row.map((rowItem: { [index: string]: string }) => {
      const rowList = Object.entries(rowItem)
      let fromIndex: number
      rowList.some((el, index) => {
        if (el[0] === colId) {
          fromIndex = index
          return true
        }
      })
      if (toIndex < fromIndex) {
        const deletedItem = rowList.splice(fromIndex, 1)
        rowList.splice(toIndex, 0, deletedItem[0])
      } else {
        rowList.splice(toIndex + 1, 0, rowList[fromIndex])
        rowList.splice(fromIndex, 1)
      }
      const rowObj = rowList.map((el: string[]) => {
        return {
          [el[0]]: el[1],
        }
      })
      const row = Object.assign({}, ...rowObj)
      newRow.push(row)
    })

    this.replaceMdFileTable({ column: newColumn, row: newRow })

    return { column: newColumn, row: newRow }
  }

  dragRow(
    dataGrid: DataGridTable,
    srcRow: { [index: string]: string },
    toIndex: number
  ): DataGridTable {
    const { column, row } = dataGrid

    let newRow = row
    let fromIndex: number
    newRow.some((el, index) => {
      console.log(el, srcRow)
      if (this.isObjShallowEqual(el, srcRow)) {
        fromIndex = index
        return true
      }
    })
    if (fromIndex === undefined) {
      throw new Error('not found fromIndex!')
    }

    if (toIndex < fromIndex) {
      const deletedItem = newRow.splice(fromIndex, 1)
      newRow.splice(toIndex, 0, deletedItem[0])
    } else {
      newRow.splice(toIndex + 1, 0, newRow[fromIndex])
      newRow.splice(fromIndex, 1)
    }

    this.replaceMdFileTable({
      column: column,
      row: newRow,
    })

    return {
      column: column,
      row: newRow,
    }
  }

  addRowBelow(dataGrid: DataGridTable, rowIndex: string): DataGridTable {
    const { column, row } = dataGrid

    const newRowList = column.map((el: { [key: string]: string }) => {
      return {
        [el.field]: '',
      }
    })
    const newRow = Object.assign({}, ...newRowList)
    row.splice(parseInt(rowIndex) + 1, 0, newRow)

    this.replaceMdFileTable({
      column: column,
      row: row,
    })

    return {
      column: column,
      row: row,
    }
  }

  deleteThisRow(dataGrid: DataGridTable, rowIndex: string): DataGridTable {
    const { column, row } = dataGrid
    if (row.length === 1) {
      new Notice('Do not allow delete only row!')
      return {
        column: column,
        row: row,
      }
    } else {
      row.splice(parseInt(rowIndex), 1)

      this.replaceMdFileTable({
        column: column,
        row: row,
      })

      return {
        column: column,
        row: row,
      }
    }
  }
}

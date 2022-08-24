import { RowData } from './../types/index';
import { ColDef } from 'ag-grid-community';
import { JSONFileSync, LowSync } from 'lowdb'
import path from 'path'
import { generateUID } from '../utils'
import type { TableData, DbData } from 'types'

export default class Database {
  private dbPath: string
  private db: LowSync
  constructor() {
    //@ts-ignore
    this.dbPath = path.join(app.vault.adapter.basePath, app.vault.configDir, "agtable.json")
    this.initDatabase()
  }

  private initDatabase() {
    const adapter = new JSONFileSync<DbData>(this.dbPath)
    this.db = new LowSync(adapter)
    this.db.read()
    this.db.data ||= {}
    this.db.write()
  }

  createNewTable(): string {
    const uid = generateUID()
    this.db.read()

    this.db.data[uid] = {
      columnDef: [{
        field: "title",
        type: "Text"
      }],
      rowData: [
        {
          'title': ""
        }
      ]
    } as TableData
    //console.log(this.db.data)
    this.db.write()
    return uid
  }

  getTableByUID(uid: string) {
    this.db.read()
    if (!this.db.data[uid]) {
      console.log(`table ${uid} does not exist!`)
      return
    }

    return this.db.data[uid]
  }


  updateTable(uid: string, tableData: TableData): boolean {
    this.db.read()
    if (!this.db.data[uid]) {
      return false
    }
    this.db.data[uid] = tableData
    this.db.write()
    return true
  }

  addNewColumn(uid: string): ColDef[] {
    const tableData = this.getTableByUID(uid) as TableData
    let newColumnNumber = 1
    tableData.columnDef.forEach((col) => {
      if (col.field.startsWith('new column')) {
        const currentColumnNumber = parseInt(col.field.slice(10,))
        if (currentColumnNumber >= newColumnNumber) {
          newColumnNumber = currentColumnNumber + 1
        }
      }
    })
    const newColumnDefs = [
      ...tableData.columnDef,
      {
        field: `new column${newColumnNumber}`,
        type: 'Text',
      },
    ]

    tableData.columnDef = newColumnDefs
    this.updateTable(uid, tableData)
    return newColumnDefs
  }

  deleteThisColumn(uid: string, selectedColField: string): TableData {
    const tableData = this.getTableByUID(uid) as TableData
    const newColumnDefs = tableData.columnDef.filter((col) => {
      return col.field != selectedColField
    })
    const newRowData = tableData.rowData.map((row) => {
      delete row[selectedColField]
      return row
    })

    tableData.columnDef = newColumnDefs
    tableData.rowData = newRowData
    this.updateTable(uid, tableData)
    return tableData
  }

  changeColumnName(uid: string, selectedColName: string, newColName: string): TableData {
    const tableData = this.getTableByUID(uid) as TableData
    const newColumnDef = tableData.columnDef.map((col) => {
      if (col.field === selectedColName) {
        col.field = newColName
      }
      return col
    })
    const newRowData = tableData.rowData.map((row: any) => {
      const rowValue = row[selectedColName]
      delete row[selectedColName]
      row[newColName] = rowValue
      return row
    })

    tableData.columnDef = newColumnDef
    tableData.rowData = newRowData
    this.updateTable(uid, tableData)
    return tableData
  }

  dragColumn(uid: string, colId: string, toIndex: number): TableData {
    const tableData = this.getTableByUID(uid) as TableData
    let fromIndex: number
    tableData.columnDef.some((col, index) => {
      if (col.field === colId) {
        fromIndex = index
        return true
      }
    })

    if (fromIndex === undefined) {
      throw new Error('not found fromIndex!')
    }

    if (fromIndex > toIndex) {
      const deletedItem = tableData.columnDef.splice(fromIndex, 1)
      tableData.columnDef.splice(toIndex, 0, deletedItem[0])
    } else if (fromIndex < toIndex) {
      tableData.columnDef.splice(toIndex + 1, 0, tableData.columnDef[fromIndex])
      tableData.columnDef.splice(fromIndex, 1)
    }

    this.updateTable(uid, tableData)
    return tableData
  }

  addRowBelow(uid: string, rowIndex: number | null): RowData[] {
    const tableData = this.getTableByUID(uid) as TableData
    const newRowData = {}
    Object.keys(tableData.rowData[0]).forEach((key) => {
      newRowData[key] = ''
    })
    if (!rowIndex) {
      tableData.rowData.push(newRowData)
      this.updateTable(uid, tableData)
      return tableData.rowData
    }
    tableData.rowData.splice(rowIndex + 1, 0, newRowData)
    this.updateTable(uid, tableData)
    return tableData.rowData
  }

  deleteThisRow(uid: string, rowIndex: number): RowData[] {
    const tableData = this.getTableByUID(uid) as TableData
    const newRowData = tableData.rowData.filter(
      (row, index) => {
        return rowIndex != index
      }
    )
    tableData.rowData = newRowData
    this.updateTable(uid, tableData)
    return newRowData
  }

  dargRow(uid: string, srcRow: RowData, toIndex: number) {
    const tableData = this.getTableByUID(uid) as TableData
    let fromIndex: number
    tableData.rowData.some((row, index) => {
      if (JSON.stringify(row) === JSON.stringify(srcRow)) {
        fromIndex = index
        return true
      }
    })

    if (fromIndex === undefined) {
      throw new Error('not found fromIndex!')
    }

    if (fromIndex > toIndex) {
      const deletedItem = tableData.rowData.splice(fromIndex, 1)
      tableData.rowData.splice(toIndex, 0, deletedItem[0])
    } else if (fromIndex < toIndex) {
      tableData.rowData.splice(toIndex + 1, 0, tableData.rowData[fromIndex])
      tableData.rowData.splice(fromIndex, 1)
    }

    this.updateTable(uid, tableData)
  }

  changeColumnType(uid: string, colName: ColDef, newType: string): ColDef[] {
    const tableData = this.getTableByUID(uid) as TableData
    let newColumnDefs = tableData.columnDef
    tableData.columnDef.some((col, index) => {
      if (col.field === colName.field) {
        newColumnDefs[index].type = newType
        return true
      }
      return false
    })

    tableData.columnDef = newColumnDefs
    this.updateTable(uid, tableData)
    return newColumnDefs
  }
}
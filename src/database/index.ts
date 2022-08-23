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
    const tableData = this.getTableByUID(uid)
    const newColumnDefs = [
      ...tableData.columnDef,
      {
        field: 'new column',
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

  addRowBelow(uid: string, rowIndex: number): RowData[] {
    const tableData = this.getTableByUID(uid) as TableData
    const newRowData = {}
    Object.keys(tableData.rowData[0]).forEach((key) => {
      newRowData[key] = ''
    })
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
}
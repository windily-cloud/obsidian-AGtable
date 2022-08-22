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

    this.db.data ||= {
      [uid]: {
        columnDef: [{
          field: "title"
        }],
        rowData: [
          {
            'title': ""
          }
        ]
      } as TableData
    }
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
    this.db[uid] = tableData
    this.db.write()
    return true
  }
}
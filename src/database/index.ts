import { Low, JSONFile } from 'lowdb'
import path from 'path'
import { generateUID } from '../utils'
import type { TableData, DbData } from 'types'

//@ts-ignore
const dbPath = path.join(app.vault.adapter.basePath, app.vault.configDir, "agtable-db.json")

console.log(dbPath)

const adapter = new JSONFile<DbData>(dbPath)
const db = new Low(adapter)

export async function createNewTable(): Promise<string | null> {
  let uid = generateUID()
  await db.read()
  console.log(db.data)

  if (`${uid}` in db.data) {
    return null
  }

  //init table content
  db.data ||= {
    [uid]: {
      columnDef: [{
        field: 'Title'
      }],
      rowData: [
        { 'Title': "rowData" }
      ]
    } as TableData
  }
  await db.write()
  return uid
}


export async function getTableByUID(uid: string) {
  await db.read()
  if (!db.data[uid]) {
    return
  }
  return db.data[uid]
}

export async function updateTable(uid: string, tableData: TableData): Promise<boolean> {
  await db.read()
  if (!db.data[uid]) {
    return false
  }
  db.data[uid] = tableData
  await db.write()
  return true
}


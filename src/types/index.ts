import type { ColDef } from 'ag-grid-community'

export interface RowData {
  [index: string]: string | number
}

export interface TableInfo {
  name?: string
}
export interface TableData {
  tableInfo: TableInfo
  columnDef: ColDef[]
  rowData?: RowData[]
}

export interface DbData {
  [uid: string]: TableData
}

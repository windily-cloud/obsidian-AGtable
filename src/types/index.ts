import type { ColDef } from 'ag-grid-community'

export interface RowData {
  [index: string]: string
}
export interface TableData {
  columnDef: ColDef[]
  rowData?: RowData[]
}

export interface DbData {
  [uid: string]: TableData
}

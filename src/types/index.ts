import type { ColDef } from 'ag-grid-community'

export interface TableData {
  columnDef: ColDef[]
  rowData?: any
}

export interface DbData {
  [uid: string]: TableData
}

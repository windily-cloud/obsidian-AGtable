import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css'
import { parseMarkdownTable } from '../utils'
import CustomFilter from '../components/CustomFilter'
import { CellContextMenuEvent } from 'ag-grid-community'
import ReactDOM from 'react-dom'
import t from '../i18n'

interface Props {
  tableId: string
  tableString: string
}

export default function DataGrid(props: Props) {
  const tableContent = parseMarkdownTable(props.tableString)
  console.log(tableContent)
  if (!tableContent) {
    return <p>{t('resolveTableFailed')}</p>
  }

  const column = tableContent[0].map((el: string, index: number) => {
    return {
      field: el,
    }
  })

  const row = tableContent.slice(1).map((row: string[]) => {
    const rowList = row.map((el: string, index: number) => {
      const columnName = tableContent[0][index]
      return {
        [columnName]: el,
      }
    })
    return Object.assign({}, ...rowList)
  })

  console.log(column, row)

  const [columnDefs] = useState(column)
  const [rowData] = useState(row)

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      flex: 1,
      editable: true,
      filter: CustomFilter,
    }),
    []
  )

  return (
    <div
      id="table-body"
      className="ag-theme-alpine-dark"
      style={{ height: '100%', width: '100%' }}
    >
      <AgGridReact
        defaultColDef={defaultColDef}
        rowData={rowData}
        columnDefs={columnDefs}
        rowDragManaged={true}
        animateRows={true}
        rowDragEntireRow={true}
        suppressContextMenu={true}
        preventDefaultOnContextMenu={true}
      ></AgGridReact>
    </div>
  )
}

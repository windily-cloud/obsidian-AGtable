import { App } from 'obsidian'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css'
import { markdownTableToDataGrid } from '../utils'
import CustomFilter from '../components/CustomFilter'
import { CellContextMenuEvent } from 'ag-grid-community'
import ReactDOM from 'react-dom'
import t from '../i18n'
import { ColDef } from 'ag-grid-community'

interface Props {
  app: App
  tableId: string
  tableString: string
}

interface DataGridTable {
  column: ColDef[]
  row: Array<{ [index: string]: string }>
}

export default function DataGrid(props: Props) {
  //data init
  if (!markdownTableToDataGrid(props.tableString)) {
    console.log("parse markdwon table failed!")
  }
  const { column, row } = markdownTableToDataGrid(props.tableString) as DataGridTable

  console.log(column, row)

  //ag-grid init
  const [columnDefs, setColumnDef] = useState(column)
  const [rowData, setRowData] = useState(row)

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

  //table menu
  const [visible, setVisible] = useState({ visible: false })

  function TableMenu() {
    const menuRef = useRef(null)
    useEffect(() => {
      document.addEventListener('click', () => {
        if (visible.visible) {
          document.addEventListener('click', () => {
            menuRef.current.style.display = 'none'
          })
          setVisible({ visible: false })
        }
      })
    })

    function handleAddRow() {
      setRowData({
        ...rowData,
      })
    }
    return (
      visible.visible && (
        <div id="table-menu" className="ag-popup" ref={menuRef}>
          <button>{t('addRowBelow')}</button>
          <button>{t('deleteThisRow')}</button>
        </div>
      )
    )
  }

  function handleContextMenu(e: any) {
    console.log(e.event)
    let rightclick = document.getElementById('table-menu')
    let clientx = e.event.pageX
    let clienty = e.event.pageY
    rightclick.style.display = 'block'
    rightclick.style.left = clientx + 'px'
    rightclick.style.top = clienty + 'px'
  }

  useEffect(() => {
    if (!document.getElementById('table-menu')) {
      const menuDiv = document.createElement('div')
      document.body.appendChild(menuDiv)
      ReactDOM.render(React.createElement(TableMenu), menuDiv)
      setVisible({ visible: true })
    }
  })

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
        onCellContextMenu={handleContextMenu}
      ></AgGridReact>
    </div>
  )
}

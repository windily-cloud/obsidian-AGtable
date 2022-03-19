import { App, editorViewField } from 'obsidian'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import {
  dataGridToMarkdownTable,
  isObjShallowEqual,
  markdownTableToDataGrid,
  replaceTable,
} from '../utils'
import CustomFilter from '../components/CustomFilter'
import ReactDOM from 'react-dom'
import t from '../i18n'
import {
  CellEditingStoppedEvent,
  ColDef,
  ColumnMovedEvent,
  DragStoppedEvent,
  RowDragEvent,
} from 'ag-grid-community'
import TableEditor from 'tableEditor'

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
  //theme init
  const isDarkMode = Array.from(document.body.classList).includes('theme-dark')

  //editor init
  const tableEditor = new TableEditor(props.app, props.tableId)
  //data init
  if (!markdownTableToDataGrid(props.tableString)) {
    console.log('parse markdwon table failed!')
  }
  const { column, row } = markdownTableToDataGrid(
    props.tableString
  ) as DataGridTable

  //console.log(column, row)

  //ag-grid init
  const [columnDefs, setColumnDefs] = useState(column)
  const [rowData, setRowData] = useState(row)

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      // sortable: true,
      flex: 1,
      editable: true,
      filter: CustomFilter,
      filterParams: {
        app: props.app,
        tableId: props.tableId,
      },
    }),
    [props.tableId]
  )

  //table menu
  const [visible, setVisible] = useState(false)
  const [rowChangeIndex, setRowChangeIndex] = useState(undefined)

  function TableMenu() {
    const menuRef = useRef(null)
    console.log('variable in table menu:', rowData)
    useEffect(() => {
      document.addEventListener('click', () => {
        if (visible) {
          document.addEventListener('click', () => {
            menuRef.current.style.display = 'none'
          })
          setVisible(false)
        }
      })
    })

    function handleAddRowBelow() {
      console.log('onAddRow start:', columnDefs, rowData)
      const { row: newRow } = tableEditor.addRowBelow(
        {
          column: columnDefs,
          row: rowData,
        },
        rowChangeIndex
      )
      setRowData(newRow)
      setVisible(false)
    }

    function handleDeleteThisRow() {
      const rowIndex = localStorage.getItem('agTableRowIndex')
      console.log('read rowIndex', rowIndex)
      if (rowIndex === undefined) {
        return
      }
      const { row: newRow } = tableEditor.deleteThisRow(
        {
          column: columnDefs,
          row: rowData,
        },
        rowIndex
      )

      setRowData(newRow)
      setVisible(false)
    }

    return (
      visible && (
        <div id="table-menu" ref={menuRef}>
          <div onClick={handleAddRowBelow}>{t('addRowBelow')}</div>
          <div onClick={handleDeleteThisRow}>{t('deleteThisRow')}</div>
        </div>
      )
    )
  }

  function handleContextMenu(e: any) {
    //console.log(e)
    localStorage.setItem('agTableRowIndex', e.rowIndex)
    localStorage.setItem('agTableChangeRow', JSON.stringify(rowData))
    console.log('set rowIndex:', e.rowIndex)
    let rightclick = document.getElementById('table-menu')
    let clientx = e.event.pageX
    let clienty = e.event.pageY
    rightclick.style.display = 'flex'
    rightclick.style.left = clientx + 'px'
    rightclick.style.top = clienty + 'px'
  }

  useEffect(() => {
    if (!document.getElementById('table-menu')) {
      const menuDiv = document.createElement('div')
      document.body.appendChild(menuDiv)
      ReactDOM.render(React.createElement(TableMenu), menuDiv)
      setVisible(true)
    }
  })

  //cell edit setting
  function onCellEditingStopped(event: CellEditingStoppedEvent) {
    const newData = event.data
    const rowIndex = event.rowIndex

    tableEditor.changeCellValue(
      { column: columnDefs, row: rowData },
      newData,
      rowIndex
    )
  }

  //column drag
  function onColumnMoved(event: ColumnMovedEvent) {
    const colId = event.column.getColId()
    const toIndex = event.toIndex
    const { column: newColumn, row: newRow } = tableEditor.dragColumn(
      { column: columnDefs, row: rowData },
      colId,
      toIndex
    )
    setColumnDefs(newColumn)
    setRowData(newRow)
  }

  function onDragStopped() {
    tableEditor.replaceMdFileTable({ column: columnDefs, row: rowData })
  }

  //row drag
  function onRowDragEnd(event: RowDragEvent) {
    console.log(event)
    const srcRowData = event.node.data
    const toIndex = event.overIndex

    const { row: newRow } = tableEditor.dragRow(
      {
        column: columnDefs,
        row: rowData,
      },
      srcRowData,
      toIndex
    )

    setRowData(newRow)
  }

  return (
    <div
      id="table-body"
      className={isDarkMode ? 'ag-theme-alpine-dark' : 'ag-theme-alpine'}
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
        onCellEditingStopped={onCellEditingStopped}
        onRowDragEnd={onRowDragEnd}
        onColumnMoved={onColumnMoved}
        onDragStopped={onDragStopped}
      ></AgGridReact>
    </div>
  )
}

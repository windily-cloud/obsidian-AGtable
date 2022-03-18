import { App } from 'obsidian'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css'
import {
  dataGridToMarkdownTable,
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
    console.log('parse markdwon table failed!')
  }
  const { column, row } = markdownTableToDataGrid(
    props.tableString
  ) as DataGridTable

  //console.log(column, row)

  //ag-grid init
  const [columnDefs] = useState(column)
  const [rowData] = useState(row)

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

    function handleAddRowBelow() {
      const newRowList = columnDefs.map((el: { [key: string]: string }) => {
        return {
          [el.field]: '',
        }
      })

      const newRow = Object.assign({}, ...newRowList)
      const rowIndex = localStorage.getItem('agTableRowIndex')
      rowData.splice(parseInt(rowIndex) + 1, 0, newRow)
      const tableString = dataGridToMarkdownTable({
        column: column,
        row: rowData,
      })
      replaceTable(props.app, props.tableId, tableString)
      setVisible({ visible: false })
    }

    function handleDeleteThisRow() {
      const rowIndex = localStorage.getItem('agTableRowIndex')
      rowData.splice(parseInt(rowIndex), 1)
      const tableString = dataGridToMarkdownTable({
        column: column,
        row: rowData,
      })
      replaceTable(props.app, props.tableId, tableString)
      setVisible({ visible: false })
    }

    return (
      visible.visible && (
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
      setVisible({ visible: true })
    }
  })

  //cell edit setting
  function onCellEditingStopped(event: CellEditingStoppedEvent) {
    console.log(event)
  }

  //column drag
  function onColumnMoved(event: ColumnMovedEvent) {
    console.log(event.api)
    const colId = event.column.getColId()
    const toIndex = event.toIndex
    console.log('start drag', colId, toIndex)
    const newColumn = column.filter((el: ColDef) => {
      return el.field != colId
    })

    newColumn.splice(toIndex, 0, { field: colId })
    console.log(newColumn)

    console.log('process row:', rowData)
    const newRow: Array<{ [key: string]: string }> = []
    console.log(rowData)
    rowData.map((rowItem: { [index: string]: string }) => {
      const rowList = Object.entries(rowItem)
      console.log('rowList:', rowList)
      let fromIndex: number
      rowList.some((el, index) => {
        if (el[0] === colId) {
          fromIndex = index
          return true
        }
      })
      console.log(fromIndex, toIndex)
      if (toIndex < fromIndex) {
        const deletedItem = rowList.splice(fromIndex, 1)
        console.log('deleteItem:', deletedItem)
        rowList.splice(toIndex, 0, deletedItem[0])
        console.log(rowList)
      } else {
        rowList.splice(toIndex + 1, 0, rowList[fromIndex])
        rowList.splice(fromIndex, 1)
      }
      const rowObj = rowList.map((el: string[]) => {
        return {
          [el[0]]: el[1],
        }
      })
      const row = Object.assign({}, ...rowObj)
      console.log('row:', row)
      newRow.push(row)
      console.log(newRow)
    })

    const tableString = dataGridToMarkdownTable({
      column: newColumn,
      row: newRow,
    })
    localStorage.setItem('agTabelMovedString', tableString)
  }

  function onDragStopped(event: DragStoppedEvent) {
    //console.log('darg end:', event)
    const tableString = localStorage.getItem('agTabelMovedString')
    replaceTable(props.app, props.tableId, tableString)
  }

  //row drag
  function onRowDragEnd(event: RowDragEvent) {
    console.log(event)
  }

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
        onCellEditingStopped={onCellEditingStopped}
        onRowDragEnd={onRowDragEnd}
        onColumnMoved={onColumnMoved}
        onDragStopped={onDragStopped}
      ></AgGridReact>
    </div>
  )
}

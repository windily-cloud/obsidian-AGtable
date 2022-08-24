import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react' // the AG Grid React Component
import 'ag-grid-enterprise'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import { AgtableSettings } from 'main'

import { isDarkMode } from 'utils'
import Database from 'database'
import { TableData } from 'types'
import {
  ColDef,
  GetContextMenuItemsParams,
  GetMainMenuItemsParams,
  MenuItemDef,
} from 'ag-grid-enterprise'
import CustomHeader from './CustomHeader'
import t from 'i18n'
import {
  CellEditingStoppedEvent,
  CellValueChangedEvent,
  ColumnMovedEvent,
  DragStoppedEvent,
  PasteEndEvent,
  RowDragEndEvent,
} from 'ag-grid-community'
import URLCellRenderer from './URLCellRenderer'
import FileCellRenderer from './FileCellRenderer'
import TagsCellRenderer from './TagsCellRenderer'

const DataGrid = (props: {
  settings: AgtableSettings
  tableId: string
  database: Database
}) => {
  const gridRef = useRef()
  const tableData = props.database.getTableByUID(props.tableId) as TableData
  tableData.columnDef[0]['rowDrag'] = true
  const [rowData, setRowData] = useState(tableData.rowData)
  const [columnDefs, setColumnDefs] = useState<ColDef[]>(tableData.columnDef)

  //DefaultColDef sets props common to all Columns
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      editable: true,
      resizable: true,
      cellEditorPopup: true,
      filter: 'agTextColumnFilter',
      headerComponent: CustomHeader,
      headerComponentParams: {
        database: props.database,
        tableId: props.tableId,
        setColumnDefs: setColumnDefs,
      },
      menuTabs: ['generalMenuTab', 'filterMenuTab', 'columnsMenuTab'],
    }),
    []
  )

  const columnTypes = {
    Text: {},
    Url: {
      cellRenderer: URLCellRenderer,
    },
    File: {
      cellRenderer: FileCellRenderer,
    },
    Tags: {
      cellRenderer: TagsCellRenderer,
    },
  }

  const getMainMenuItems = useCallback(
    (params: GetMainMenuItemsParams): (string | MenuItemDef)[] => {
      const colDef = params.column.getColDef()
      const customMenuItems: (MenuItemDef | string)[] =
        params.defaultItems.slice(0)

      customMenuItems.unshift({
        name: 'Type',
        subMenu: [
          {
            name: 'Text',
            action: () => {
              const newColumnDefs = props.database.changeColumnType(
                props.tableId,
                colDef,
                'Text'
              )
              newColumnDefs[0]['rowDrag'] = true
              setColumnDefs(newColumnDefs)
            },
            checked: colDef.type === 'Text',
          },
          {
            name: 'File',
            action: () => {
              const newColumnDefs = props.database.changeColumnType(
                props.tableId,
                colDef,
                'File'
              )
              newColumnDefs[0]['rowDrag'] = true
              setColumnDefs(newColumnDefs)
            },
            checked: colDef.type === 'File',
          },
          {
            name: 'Tags',
            action: () => {
              const newColumnDefs = props.database.changeColumnType(
                props.tableId,
                colDef,
                'Tags'
              )
              newColumnDefs[0]['rowDrag'] = true
              setColumnDefs(newColumnDefs)
            },
            checked: colDef.type === 'Tags',
          },
          {
            name: 'Url',
            action: () => {
              const newColumnDefs = props.database.changeColumnType(
                props.tableId,
                colDef,
                'Url'
              )
              newColumnDefs[0]['rowDrag'] = true
              setColumnDefs(newColumnDefs)
            },
            checked: colDef.type === 'Url',
          },
        ],
      })
      return customMenuItems
    },
    []
  )

  const getContextMenuItems = useCallback(
    (params: GetContextMenuItemsParams): (string | MenuItemDef)[] => {
      //console.log(params)
      let result: (string | MenuItemDef)[] = [
        {
          // custom item
          name: t('addRowBelow'),
          action: () => {
            let rowIndex: number | null
            try {
              rowIndex = params.node.rowIndex
            } catch {
              rowIndex = null
            }
            const newRowData = props.database.addRowBelow(
              props.tableId,
              rowIndex
            )
            setRowData(newRowData)
          },
        },
        {
          // custom item
          name: t('deleteThisRow'),
          action: () => {
            const rowindex = params.node.rowIndex
            const newRowData = props.database.deleteThisRow(
              props.tableId,
              rowindex
            )
            setRowData(newRowData)
          },
        },
        'copy',
        'copyWithHeaders',
        'paste',
        'separator',
        'export',
      ]
      return result
    },
    []
  )

  const onCellEditingStopped = (event: CellEditingStoppedEvent) => {
    const newValue = event.newValue
    const rowIndex = event.rowIndex
    const colKey = event.column.getColId()
    const tableData = props.database.getTableByUID(props.tableId) as TableData

    tableData.rowData[rowIndex][colKey] = newValue
    //console.log(rowIndex, event, colKey, tableData)
    const updataStatus = props.database.updateTable(props.tableId, tableData)
    if (!updataStatus) {
      console.log('Update table failed!')
      console.log('colKey:', colKey)
      console.log('tableData:', tableData)
    }
  }

  // const onColumnMoved = (event: ColumnMovedEvent) => {
  //   const toIndex = event.toIndex
  //   const colId = event.column.getColId()
  //   props.database.dragColumn(props.tableId, colId, toIndex)
  //   const newTableData = props.database.getTableByUID(
  //     props.tableId
  //   ) as TableData
  //   newTableData.columnDef[0]['rowDrag'] = true
  //   event.api.setColumnDefs(newTableData.columnDef)
  //   event.api.setRowData(newTableData.rowData)
  // }
  let clickedColumn = ''
  let clickedColumnIndex: number = undefined
  let isColumnDrag = false
  const onColumnMoved = (event: ColumnMovedEvent) => {
    clickedColumn = event.column.getColId()
    clickedColumnIndex = event.toIndex
    isColumnDrag = true
  }

  const onDragStopped = (event: DragStoppedEvent) => {
    if (isColumnDrag && clickedColumn && clickedColumnIndex) {
      props.database.dragColumn(
        props.tableId,
        clickedColumn,
        clickedColumnIndex
      )
      const newTableData = props.database.getTableByUID(
        props.tableId
      ) as TableData
      newTableData.columnDef[0]['rowDrag'] = true
      event.api.setColumnDefs(newTableData.columnDef)
      event.api.setRowData(newTableData.rowData)
    }
  }

  const onRowDragEnd = (event: RowDragEndEvent) => {
    const srcRow = event.node.data
    const toIndex = event.overIndex
    props.database.dragRow(props.tableId, srcRow, toIndex)
  }

  const statusBar = {
    statusPanels: [
      {
        statusPanel: 'agTotalAndFilteredRowCountComponent',
        align: 'left',
      },
      {
        statusPanel: 'agAggregationComponent',
        statusPanelParams: {
          // possible values are: 'count', 'sum', 'min', 'max', 'avg'
          aggFuncs: ['avg', 'sum'],
        },
        align: 'left',
      },
    ],
  }

  const onCellValueChanged = useCallback((params: CellValueChangedEvent) => {
    if (params.source != 'paste') {
      return
    }
    const rowIndex = params.rowIndex
    const pasteData = params.data
    const tableData = props.database.getTableByUID(props.tableId) as TableData
    const newRowData = tableData.rowData.map((row, index) => {
      if (index === rowIndex) {
        return pasteData
      } else {
        return row
      }
    })
    tableData.rowData = newRowData
    props.database.updateTable(props.tableId, tableData)
  }, [])

  const onGridReady = useCallback(() => {}, [])

  return (
    <div
      id="table-body"
      className={isDarkMode() ? 'ag-theme-alpine-dark' : 'ag-theme-alpine'}
      style={{ height: '100%', width: '100%' }}
    >
      <AgGridReact
        ref={gridRef} // Ref for accessing Grid's API
        rowData={rowData} // Row Data for Rows
        columnDefs={columnDefs} // Column Defs for Columns
        defaultColDef={defaultColDef} // Default Column Properties
        onCellEditingStopped={onCellEditingStopped}
        rowDragManaged={true}
        onRowDragEnd={onRowDragEnd}
        onColumnMoved={onColumnMoved}
        onDragStopped={onDragStopped}
        stopEditingWhenCellsLoseFocus={true}
        columnTypes={columnTypes}
        tooltipShowDelay={6000}
        tooltipHideDelay={1000}
        //sideBar={'columns'}
        onCellValueChanged={onCellValueChanged}
        statusBar={statusBar}
        animateRows={true} // Optional - set to 'true' to have rows animate when sorted
        rowSelection="multiple" // Options - allows click selection of rows
        enableRangeSelection={true}
        getMainMenuItems={getMainMenuItems}
        getContextMenuItems={getContextMenuItems}
        onGridReady={onGridReady}
      />
    </div>
  )
}

export default DataGrid

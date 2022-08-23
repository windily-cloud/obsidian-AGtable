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
import { Console } from 'console'
import t from 'i18n'
import { CellEditingStoppedEvent, RowDragEndEvent } from 'ag-grid-community'

const DataGrid = (props: {
  settings: AgtableSettings
  tableId: string
  database: Database
}) => {
  const gridRef = useRef()
  const tableData = props.database.getTableByUID(props.tableId)
  const [rowData, setRowData] = useState(tableData.rowData)
  const [columnDefs, setColumnDefs] = useState<ColDef[]>(tableData.columnDef)

  //DefaultColDef sets props common to all Columns
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      editable: true,
      cellEditorPopup: true,
      rowDrag: true,
      filter: true,
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
    Url: {},
  }

  const getMainMenuItems = useCallback(
    (params: GetMainMenuItemsParams): (string | MenuItemDef)[] => {
      const colDef = params.column.getColDef()
      const customMenuItems: (MenuItemDef | string)[] =
        params.defaultItems.slice(0)
      customMenuItems.push({
        name: 'Add New Column',
        action: () => {
          const newColumnDefs = props.database.addNewColumn(props.tableId)
          setColumnDefs(newColumnDefs)
        },
      })

      customMenuItems.push({
        name: 'Delete This Column',
        action: () => {
          const tableData = props.database.deleteThisColumn(
            props.tableId,
            colDef.field
          )
          setColumnDefs(tableData.columnDef)
          setRowData(tableData.rowData)
        },
      })

      customMenuItems.push({
        name: 'Type',
        subMenu: [
          {
            name: 'Text',
            action: () => {
              const tableData = props.database.getTableByUID(
                props.tableId
              ) as TableData
              let newColumnDefs = tableData.columnDef
              tableData.columnDef.some((col, index) => {
                if (col.field === colDef.field) {
                  newColumnDefs[index].type = 'Text'
                  return true
                }
                return false
              })
            },
            checked: colDef.type === 'Text',
          },
          {
            name: 'Url',
            action: () => {
              const tableData = props.database.getTableByUID(
                props.tableId
              ) as TableData
              let newColumnDefs = tableData.columnDef
              tableData.columnDef.some((col, index) => {
                if (col.field === colDef.field) {
                  newColumnDefs[index].type = 'Url'
                  return true
                }
                return false
              })

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
      console.log(params)
      let result: (string | MenuItemDef)[] = [
        {
          // custom item
          name: t('addRowBelow'),
          action: () => {
            const rowIndex = params.node.rowIndex
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

  const onRowDragEnd = (event: RowDragEndEvent) => {
    console.log(event)
    const srcRow = event.node.data
    const toIndex = event.overIndex
    props.database.dargRow(props.tableId, srcRow, toIndex)
  }

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
        stopEditingWhenCellsLoseFocus={true}
        columnTypes={columnTypes}
        animateRows={true} // Optional - set to 'true' to have rows animate when sorted
        rowSelection="multiple" // Options - allows click selection of rows
        getMainMenuItems={getMainMenuItems}
        getContextMenuItems={getContextMenuItems}
        onGridReady={onGridReady}
      />
    </div>
  )
}

export default DataGrid

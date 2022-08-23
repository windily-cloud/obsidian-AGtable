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
import { CellEditingStoppedEvent } from 'ag-grid-community'

const DataGrid = (props: {
  settings: AgtableSettings
  tableId: string
  database: Database
}) => {
  const gridRef = useRef()
  // useEffect(() => {
  //   getTableByUID(props.tableId).then((tableData: TableData) => {
  //     setColumnDefs(tableData.columnDef)
  //     setRowData(tableData.rowData)
  //   })
  //   return () => {
  //     setColumnDefs([])
  //     setRowData(null)
  //   }
  // }, [])
  const tableData = props.database.getTableByUID(props.tableId)
  console.log(tableData)
  const [rowData, setRowData] = useState(tableData.rowData)

  // Each Column Definition results in one Column.
  const [columnDefs, setColumnDefs] = useState<ColDef[]>(tableData.columnDef)

  //DefaultColDef sets props common to all Columns
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      editable: true,
      cellEditorPopup: true,
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
          const tableData = props.database.getTableByUID(props.tableId)
          const newColumnDefs = [
            ...tableData.columnDef,
            {
              field: 'new column',
              type: 'Text',
            },
          ]
          setColumnDefs(newColumnDefs)
          tableData.columnDef = newColumnDefs
          props.database.updateTable(props.tableId, tableData)
        },
      })

      customMenuItems.push({
        name: 'Delete This Column',
        action: () => {
          const tableData = props.database.getTableByUID(
            props.tableId
          ) as TableData
          const newColumnDefs = tableData.columnDef.filter((col) => {
            return col.field != colDef.field
          })
          setColumnDefs(newColumnDefs)
          tableData.columnDef = newColumnDefs
          props.database.updateTable(props.tableId, tableData)
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
            const tableData = props.database.getTableByUID(
              props.tableId
            ) as TableData
            const index = params.node.rowIndex
            const newRowData = {}
            Object.keys(tableData.rowData[0]).forEach((key) => {
              newRowData[key] = ''
            })
            tableData.rowData.splice(index + 1, 0, newRowData)
            setRowData(tableData.rowData)
            props.database.updateTable(props.tableId, tableData)
          },
        },
        {
          // custom item
          name: t('deleteThisRow'),
          action: () => {
            const tableData = props.database.getTableByUID(
              props.tableId
            ) as TableData
            const rowindex = params.node.rowIndex
            const newRowData = tableData.rowData.filter(
              (row: any, index: number) => {
                return rowindex != index
              }
            )
            tableData.rowData = newRowData
            setRowData(tableData.rowData)
            props.database.updateTable(props.tableId, tableData)
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

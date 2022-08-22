import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react' // the AG Grid React Component
import 'ag-grid-enterprise'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import { AgtableSettings } from 'main'

import { isDarkMode } from 'utils'
import { getTableByUID } from 'database'
import { TableData } from 'types'
import { ColDef, GetMainMenuItemsParams, MenuItemDef } from 'ag-grid-enterprise'
import CustomHeader from './CustomHeader'

const DataGrid = (props: { settings: AgtableSettings; tableId: string }) => {
  const gridRef = useRef()
  useEffect(() => {
    getTableByUID(props.tableId).then((tableData: TableData) => {
      setColumnDefs(tableData.columnDef)
      setRowData(tableData.rowData)
    })
  }, [])

  const [rowData, setRowData] = useState()

  // Each Column Definition results in one Column.
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([])

  //DefaultColDef sets props common to all Columns
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      editable: true,
      cellEditorPopup: true,
      filter: true,
      headerComponent: CustomHeader,
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
        action: async () => {
          const tableData = await getTableByUID(props.tableId)
          const newColumnDefs = [
            ...tableData.columnDef,
            {
              field: 'new cloumn',
              type: 'Text',
            },
          ]
          setColumnDefs(newColumnDefs)
        },
      })

      customMenuItems.push({
        name: 'Delete This Column',
        action: async () => {
          const tableData = await getTableByUID(props.tableId)
          const newColumnDefs = tableData.columnDef.filter((col) => {
            return col.field != colDef.field
          })
          setColumnDefs(newColumnDefs)
        },
      })

      customMenuItems.push({
        name: 'Type',
        subMenu: [
          {
            name: 'Text',
            action: async () => {
              const tableData = await getTableByUID(props.tableId)
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
            action: async () => {
              const tableData = await getTableByUID(props.tableId)
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

  const onGridReady = useCallback(async () => {
    // const tableData = (await getTableByUID(props.tableId)) as TableData
    // setColumnDefs(tableData.columnDef)
    // setRowData(tableData.rowData)
  }, [])

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
        columnTypes={columnTypes}
        animateRows={true} // Optional - set to 'true' to have rows animate when sorted
        rowSelection="multiple" // Options - allows click selection of rows
        getMainMenuItems={getMainMenuItems}
        onGridReady={onGridReady}
      />
    </div>
  )
}

export default DataGrid

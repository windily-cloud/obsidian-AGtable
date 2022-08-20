import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react' // the AG Grid React Component
import Request from 'api'

import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import { AgtableSettings } from 'main'

import type { ColDef } from 'ag-grid-community'
import { isDarkMode } from 'utils'
import { Menu, Point } from 'obsidian'
import t from 'i18n'

function handleContextMenu(params: any) {
  // console.log(params.rowIndex)

  this.clickedRowIndex = params.rowIndex

  const menu = new Menu(this.app)
  menu.addItem((item) =>
    item
      .setTitle(t('addRowBelow'))
      .setIcon('duplicate-glyph')
      .onClick(() => {
        this.handleAddRowBelow()
      })
  )

  menu.addItem((item) => {
    item
      .setTitle(t('deleteThisRow'))
      .setIcon('cross-in-box')
      .onClick(() => {
        this.handleDeleteThisRow()
      })
  })

  menu.addItem((item) => {
    item
      .setTitle(t('convertToMdTable'))
      .setIcon('down-curly-arrow-glyph')
      .onClick(() => {
        this.tableEditor.agTableToMarkdowntable()
      })
  })
  menu.showAtPosition(params.event as Point)
}

const DataGrid = (props: { settings: AgtableSettings }) => {
  const gridRef = useRef()
  const [rowData, setRowData] = useState()

  // Each Column Definition results in one Column.
  const [columnDefs, setColumnDefs] = useState([])

  //DefaultColDef sets props common to all Columns
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      editable: true,
      cellEditorPopup: true,
      filter: true,
    }),
    []
  )

  // Example load data from sever
  // useEffect(() => {
  // }, [])

  const onGridReady = useCallback(() => {
    const request = new Request(props.settings)
    request
      .getTableContent('obsidian-database', 'bookmark')
      .then((response) => {
        console.log(response.data)

        let initColumnDef: Array<ColDef> = []
        Object.keys(response.data.list[0]).forEach((el) => {
          if (el != 'Id') {
            initColumnDef.push({ field: el })
          }
        })
        console.log(initColumnDef)
        setColumnDefs(initColumnDef)
        setRowData(response.data.list)
      })
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
        animateRows={true} // Optional - set to 'true' to have rows animate when sorted
        //rowSelection="multiple" // Options - allows click selection of rows
        preventDefaultOnContextMenu={true}
        onCellContextMenu={handleContextMenu}
        onGridReady={onGridReady}
      />
    </div>
  )
}

export default DataGrid

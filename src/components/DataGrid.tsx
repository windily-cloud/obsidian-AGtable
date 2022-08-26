import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react' // the AG Grid React Component
import 'ag-grid-enterprise'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import { AgtableSettings } from 'main'

import { csvToObject, excelToObject, isDarkMode } from 'utils'
import { getAPI, Link } from 'obsidian-dataview'
import Database from 'database'
import { RowData, TableData } from 'types'
import {
  ColDef,
  GetContextMenuItemsParams,
  GetMainMenuItemsParams,
  MenuItemDef,
} from 'ag-grid-enterprise'
import CustomHeader from './header/AGtableHeader'
import t, { locale } from 'i18n'
import {
  CellEditingStoppedEvent,
  CellValueChangedEvent,
  ColumnMovedEvent,
  DragStoppedEvent,
  GridReadyEvent,
  RowDragEndEvent,
  SideBarDef,
} from 'ag-grid-community'
import URLCellRenderer from './cell-renderer/URLCellRenderer'
import FileCellRenderer from './cell-renderer/FileCellRenderer'
import TagsCellRenderer from './cell-renderer/TagsCellRenderer'
import GenericWideInputPrompt from './prompt/GenericWideInputPrompt'
import CustomStatusBar from './status-bar/TableNameStatusBar'
import SettingsSidebar from './sidebar/SettingsSidebar'
import { QueryResult } from 'obsidian-dataview/lib/api/plugin-api'
import { Notice } from 'obsidian'

const DataGrid = (props: {
  settings: AgtableSettings
  tableId: string
  database: Database
}) => {
  const gridRef = useRef<AgGridReact>(null)
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
      enablePivot: true,
      enableRowGroup: true,
      enableValue: true,
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
    Number: {},
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
        name: 'ChartDataType',
        subMenu: [
          {
            name: 'category',
            action: () => {
              const newColumnDefs = props.database.changeColumnChartType(
                props.tableId,
                colDef,
                'category'
              )
              newColumnDefs[0]['rowDrag'] = true
              setColumnDefs(newColumnDefs)
            },
            checked: colDef.chartDataType === 'category',
          },
          {
            name: 'series',
            action: () => {
              const newColumnDefs = props.database.changeColumnChartType(
                props.tableId,
                colDef,
                'series'
              )
              newColumnDefs[0]['rowDrag'] = true
              setColumnDefs(newColumnDefs)
            },
            checked: colDef.chartDataType === 'series',
          },
          {
            name: 'time',
            action: () => {
              const newColumnDefs = props.database.changeColumnChartType(
                props.tableId,
                colDef,
                'time'
              )
              newColumnDefs[0]['rowDrag'] = true
              setColumnDefs(newColumnDefs)
            },
            checked: colDef.chartDataType === 'time',
          },
          {
            name: 'excluded',
            action: () => {
              const newColumnDefs = props.database.changeColumnChartType(
                props.tableId,
                colDef,
                'excluded'
              )
              newColumnDefs[0]['rowDrag'] = true
              setColumnDefs(newColumnDefs)
            },
            checked: colDef.chartDataType === 'excluded',
          },
        ],
      })

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
            name: 'Number',
            action: () => {
              const newColumnDefs = props.database.changeColumnType(
                props.tableId,
                colDef,
                'Number'
              )
              newColumnDefs[0]['rowDrag'] = true
              setColumnDefs(newColumnDefs)
            },
            checked: colDef.type === 'Number',
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
        {
          name: 'Import',
          subMenu: [
            {
              name: 'CSV',
              action: async () => {
                const inputValue = await GenericWideInputPrompt.Prompt(
                  app,
                  'Input csv format',
                  `eg:(The first line is column name)\nid,name,age,gender\n1,Roberta,39,M\n2,Oliver,25,M\n3,Shayna,18,F\n4,Fechin,18,M`
                )
                const csvList = csvToObject(inputValue)
                //console.log(csvList)
                const columnDefs = Object.keys(csvList[0]).map(
                  (key: string) => {
                    return {
                      field: key,
                      type: 'Text',
                    }
                  }
                )
                csvList.shift()
                const tableData = {
                  columnDef: columnDefs,
                  rowData: csvList,
                } as TableData
                props.database.updateTable(props.tableId, tableData)
                params.api.setColumnDefs(tableData.columnDef)
                setRowData(tableData.rowData)
              },
            },
            {
              name: 'Excel',
              action: async () => {
                const inputValue = await GenericWideInputPrompt.Prompt(
                  app,
                  'Input csv format',
                  `eg:(The first line is column name)\nid	name	age	gender\n1	Roberta	39	M\n2	Oliver	25	M\n3	Shayna	18	F\n4	Fechin	18	M`
                )
                const csvList = excelToObject(inputValue)
                //console.log(csvList)
                const columnDefs = Object.keys(csvList[0]).map(
                  (key: string) => {
                    return {
                      field: key,
                      type: 'Text',
                    }
                  }
                )
                csvList.shift()
                const tableData = {
                  columnDef: columnDefs,
                  rowData: csvList,
                } as TableData
                props.database.updateTable(props.tableId, tableData)
                params.api.setColumnDefs(tableData.columnDef)
                setRowData(tableData.rowData)
              },
            },
            {
              name: 'Dataview',
              action: async () => {
                const inputValue = await GenericWideInputPrompt.Prompt(
                  app,
                  'Input csv format',
                  `eg:table name from "00-tips"`
                )
                const dv = getAPI()
                const queryResult: any = await dv.tryQuery(inputValue)
                if (queryResult.type != 'table') {
                  new Notice('Please use table query!')
                  return
                }

                const columnDefs = queryResult.headers.map(
                  (headerName: string) => {
                    return {
                      field: headerName,
                      type: 'Text',
                    }
                  }
                )

                let rowData: RowData[] = []
                queryResult.values.map((queryArr: any[]) => {
                  let row = {}
                  queryArr.forEach(
                    (queryColumnValue: Link | string, index: number) => {
                      if (typeof queryColumnValue === 'string') {
                        row[columnDefs[index].field] = queryColumnValue
                      } else if (queryColumnValue === null) {
                        row[columnDefs[index].field] = ''
                      } else if (queryColumnValue.fileName) {
                        row[columnDefs[index].field] =
                          queryColumnValue.fileName()
                      } else {
                        throw Error('AGtable need more support this case!')
                      }
                    }
                  )
                  rowData.push(row)
                })
                tableData.columnDef = columnDefs
                tableData.rowData = rowData
                props.database.updateTable(props.tableId, tableData)
                params.api.setColumnDefs(tableData.columnDef)
                setRowData(tableData.rowData)
              },
            },
          ],
        },
        'export',
        'chartRange',
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
    setRowData(tableData.rowData)
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

  //status bar
  const statusBar = {
    statusPanels: [
      {
        statusPanel: CustomStatusBar,
        statusPanelParams: {
          database: props.database,
          tableId: props.tableId,
        },
        align: 'left',
      },
      {
        statusPanel: 'agTotalAndFilteredRowCountComponent',
        align: 'left',
      },
      {
        statusPanel: 'agAggregationComponent',
        statusPanelParams: {
          // possible values are: 'count', 'sum', 'min', 'max', 'avg'
          aggFuncs: ['min', 'max', 'avg', 'sum'],
        },
        align: 'left',
      },
    ],
  }

  //sidebar
  const sideBar = useMemo<
    SideBarDef | string | string[] | boolean | null
  >(() => {
    return {
      toolPanels: [
        {
          id: 'settings',
          labelDefault: 'AGtable Settings',
          labelKey: 'settings',
          iconKey: 'menu',
          toolPanel: SettingsSidebar,
        },
        {
          id: 'columns',
          labelDefault: 'Columns',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
        },
        {
          id: 'filters',
          labelDefault: 'Filters',
          labelKey: 'filters',
          iconKey: 'filter',
          toolPanel: 'agFiltersToolPanel',
        },
      ],
      defaultToolPanel: 'settings',
    }
  }, [])

  //paste
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

  const localeText = useMemo<{
    [key: string]: string
  }>(() => {
    return locale
  }, [])

  const onGridReady = useCallback((params: GridReadyEvent) => {
    gridRef.current!.api.closeToolPanel()
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
        onCellEditingStopped={onCellEditingStopped}
        rowDragManaged={true}
        onRowDragEnd={onRowDragEnd}
        onColumnMoved={onColumnMoved}
        onDragStopped={onDragStopped}
        stopEditingWhenCellsLoseFocus={true}
        columnTypes={columnTypes}
        sideBar={sideBar}
        onCellValueChanged={onCellValueChanged}
        statusBar={statusBar}
        animateRows={true} // Optional - set to 'true' to have rows animate when sorted
        rowSelection="multiple" // Options - allows click selection of rows
        enableRangeSelection={true}
        getMainMenuItems={getMainMenuItems}
        getContextMenuItems={getContextMenuItems}
        enableBrowserTooltips={true}
        enableCharts={true}
        localeText={localeText}
        onGridReady={onGridReady}
      />
    </div>
  )
}

export default DataGrid

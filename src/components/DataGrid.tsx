import { App } from 'obsidian'
import React from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import CustomFilter from '../components/CustomFilter'
import t from '../i18n'
import {
  CellEditingStoppedEvent,
  ColDef,
  ColumnMovedEvent,
  DragStoppedEvent,
  RowDragEvent,
} from 'ag-grid-community'
import TableEditor from 'tableEditor'
import ReactDOM from 'react-dom'

interface Props {
  app: App
  tableId: string
  tableString: string
}

interface State {
  columnDefs: ColDef[]
  rowData: Array<{ [key: string]: string }>
  showMenu: boolean
}

interface DataGridTable {
  column: ColDef[]
  row: Array<{ [index: string]: string }>
}

if (!document.getElementById('table-menu-container')) {
  const menuDiv = document.createElement('div')
  menuDiv.id = 'table-menu-container'
  document.body.appendChild(menuDiv)
}
const modalRoot = document.getElementById('table-menu-container')

interface MenuProps {
  showMenu: boolean
}
class Modal extends React.Component<MenuProps> {
  render() {
    if (this.props.showMenu) {
      return ReactDOM.createPortal(
        this.props.children,
        document.getElementById('table-menu-container')
      )
    } else {
      return <></>
    }
  }
}

export default class DataGrid extends React.Component<Props, State> {
  app: App
  tableEditor: TableEditor
  defaultColDef: { [key: string]: any }
  clickedRowIndex: string | null
  clickedColumn: string
  clickedColumnIndex: number | null
  isColumnDrag: boolean
  constructor(props: Props) {
    super(props)
    this.app = props.app
    this.tableEditor = new TableEditor(this.app, props.tableId)

    //init data grid
    const { column, row } = this.tableEditor.markdownTableToDataGrid(
      props.tableString
    ) as DataGridTable

    this.defaultColDef = {
      //resizable: true,
      flex: 1,
      editable: true,
      filter: CustomFilter,
      filterParams: {
        app: props.app,
        tableId: props.tableId,
        tableEditor: this.tableEditor,
      },
    }

    //init temp variable

    this.clickedRowIndex = null
    this.clickedColumnIndex = null
    this.isColumnDrag = false

    //init state
    this.state = {
      columnDefs: column,
      rowData: row,
      showMenu: false,
    }

    this.handleContextMenu = this.handleContextMenu.bind(this)
    this.handleAddRowBelow = this.handleAddRowBelow.bind(this)
    this.handleDeleteThisRow = this.handleDeleteThisRow.bind(this)
    this.onCellEditingStopped = this.onCellEditingStopped.bind(this)
    this.onColumnMoved = this.onColumnMoved.bind(this)
    this.onDragStopped = this.onDragStopped.bind(this)
    this.onRowDragEnd = this.onRowDragEnd.bind(this)
  }

  componentDidMount(): void {
    document.addEventListener('click', () => {
      this.setState({ showMenu: false })
    })
  }

  componentWillUnmount(): void {
    modalRoot.remove()
  }

  private isDarkMode(): boolean {
    return Array.from(document.body.classList).includes('theme-dark')
  }

  handleContextMenu(params: any) {
    console.log(params.rowIndex)

    this.clickedRowIndex = params.rowIndex
    this.setState({ showMenu: true })

    console.log(this.state.showMenu)
    let rightclick = document.getElementById('table-menu-container')
    let clientx = params.event.pageX
    let clienty = params.event.pageY
    rightclick.style.left = clientx + 'px'
    rightclick.style.top = clienty + 'px'
  }

  handleAddRowBelow() {
    if (this.clickedRowIndex === null || undefined) {
      return
    }

    const { row: newRow } = this.tableEditor.addRowBelow(
      {
        column: this.state.columnDefs,
        row: this.state.rowData,
      },
      this.clickedRowIndex
    )

    this.setState({ rowData: newRow, showMenu: false })
  }

  handleDeleteThisRow() {
    const rowIndex = this.clickedRowIndex
    if (rowIndex === null || undefined) {
      return
    }

    const { row: newRow } = this.tableEditor.deleteThisRow(
      {
        column: this.state.columnDefs,
        row: this.state.rowData,
      },
      rowIndex
    )

    this.setState({ rowData: newRow, showMenu: false })
  }

  onCellEditingStopped(event: CellEditingStoppedEvent) {
    const newData = event.data
    const rowIndex = event.rowIndex

    this.tableEditor.changeCellValue(
      { column: this.state.columnDefs, row: this.state.rowData },
      newData,
      rowIndex
    )
  }

  onColumnMoved(event: ColumnMovedEvent) {
    this.clickedColumn = event.column.getColId()
    this.clickedColumnIndex = event.toIndex
    this.isColumnDrag = true
  }

  onDragStopped(event: DragStoppedEvent) {
    console.log('dragStoped:', event)
    if (this.isColumnDrag) {
      const { column: newColumn, row: newRow } = this.tableEditor.dragColumn(
        { column: this.state.columnDefs, row: this.state.rowData },
        this.clickedColumn,
        this.clickedColumnIndex
      )

      this.setState({ columnDefs: newColumn, rowData: newRow })

      this.tableEditor.replaceMdFileTable({
        column: newColumn,
        row: newRow,
      })

      this.isColumnDrag = false
    }
  }

  onRowDragEnd(event: RowDragEvent) {
    const srcRowData = event.node.data
    const toIndex = event.overIndex

    //console.log('dragRowEvent:', event, srcRowData, toIndex)
    const { column: newColumn, row: newRow } = this.tableEditor.dragRow(
      {
        column: this.state.columnDefs,
        row: this.state.rowData,
      },
      srcRowData,
      toIndex
    )

    this.setState({ rowData: newRow })
    this.tableEditor.replaceMdFileTable({
      column: newColumn,
      row: newRow,
    })
  }

  render() {
    return (
      <div
        id="table-body"
        className={
          this.isDarkMode() ? 'ag-theme-alpine-dark' : 'ag-theme-alpine'
        }
        style={{ height: '100%', width: '100%' }}
      >
        <AgGridReact
          defaultColDef={this.defaultColDef}
          rowData={this.state.rowData}
          columnDefs={this.state.columnDefs}
          rowDragManaged={true}
          animateRows={true}
          rowDragEntireRow={true}
          suppressContextMenu={true}
          preventDefaultOnContextMenu={true}
          onCellContextMenu={this.handleContextMenu}
          onCellEditingStopped={this.onCellEditingStopped}
          stopEditingWhenCellsLoseFocus={true}
          onRowDragEnd={this.onRowDragEnd}
          onColumnMoved={this.onColumnMoved}
          onDragStopped={this.onDragStopped}
        ></AgGridReact>
        <Modal showMenu={this.state.showMenu}>
          <div onClick={this.handleAddRowBelow}>{t('addRowBelow')}</div>
          <div onClick={this.handleDeleteThisRow}>{t('deleteThisRow')}</div>
        </Modal>
      </div>
    )
  }
}

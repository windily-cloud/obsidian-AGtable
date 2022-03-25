import React, { ChangeEvent } from 'react'
import { useRef } from 'react'
import { ColDef, IHeaderParams, RowNode } from 'ag-grid-community'
import { App, Menu, Point } from 'obsidian'
import TableEditor from 'tableEditor'
import t from 'i18n'

interface Props extends IHeaderParams {
  app: App
  tableId: string
  tableEditor: TableEditor
}

interface State {
  isEditing: boolean
  newColumnName: string
}

interface RowData {
  [key: string]: string
}

export default class CustomHeader extends React.Component<Props, State> {
  inputRef: React.RefObject<HTMLInputElement>
  constructor(props: Props) {
    super(props)

    this.state = {
      isEditing: false,
      newColumnName: this.props.displayName,
    }

    this.inputRef = React.createRef()

    this.handleContextMenu = this.handleContextMenu.bind(this)
    this.handleDoubleClick = this.handleDoubleClick.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleInputExit = this.handleInputExit.bind(this)
    this.handleInputBlur = this.handleInputBlur.bind(this)
    this.addColumn = this.addColumn.bind(this)
    this.deleteColumn = this.deleteColumn.bind(this)
    this.renameColumn = this.renameColumn.bind(this)
  }

  handleContextMenu(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault()
    const menu = new Menu(this.props.app)
    menu.addItem((item) =>
      item
        .setTitle(t('addColumn'))
        .setIcon('right-arrow')
        .onClick(() => {
          this.addColumn()
        })
    )

    menu.addItem((item) => {
      item
        .setTitle(t('deleteThisColumn'))
        .setIcon('trash')
        .onClick(() => {
          this.deleteColumn()
        })
    })
    const x = event.clientX
    const y = event.clientY
    menu.showAtPosition({ x, y } as Point)
  }

  handleDoubleClick(event: React.MouseEvent<HTMLDivElement>) {
    //console.log(event)
    event.preventDefault()
    event.stopPropagation()
    //this.props.api.setSuppressRowDrag(true)
    this.setState({ isEditing: true })
  }

  handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ newColumnName: event.target.value })
  }

  handleInputExit(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === 'Escape') {
      this.renameColumn()
      this.setState({ isEditing: false })
    }
  }

  handleInputBlur() {
    this.renameColumn()
    this.setState({ isEditing: false })
  }

  renameColumn() {
    const thisColumn = this.props.column.getColId()
    const newName = this.state.newColumnName
    const columns = this.props.api.getColumnDefs()
    //console.log(thisColumn, columns)
    const newColumns = columns.map((el: ColDef) => {
      if (el.colId === thisColumn) {
        el.field = newName
        el.colId = newName
        return el
      }
      return el
    })
    //console.log('row model:', this.props.rowModel)
    this.props.api.setColumnDefs(newColumns)

    const newRow: Array<{ [key: string]: string }> = []
    this.props.api.getModel().forEachNode((rowNode: RowNode) => {
      //console.log(rowNode.data)
      const rowList = Object.entries(rowNode.data).map((el: RowData) => {
        if (el[0] === thisColumn) {
          return {
            [newName]: el[1],
          }
        } else {
          return {
            [el[0]]: el[1],
          }
        }
      })

      const row = Object.assign({}, ...rowList)
      newRow.push(row)
    })
    //console.log(newRow)
    this.props.api.setRowData(newRow)

    // const column = this.props.api.getColumnDefs()
    // const tableString = this.props.tableEditor.dataGridToMarkdownTable({
    //   column: column,
    //   row: newRow,
    // })
    this.props.tableEditor.replaceMdFileTable({
      column: newColumns,
      row: newRow,
    })
  }

  addColumn() {
    const thisColumn = this.props.column.getColId()
    const column = this.props.api.getColumnDefs()

    const index = column
      .map((el: ColDef) => {
        return el.colId
      })
      .indexOf(thisColumn)

    let newColumnIndex = 0
    column.forEach((el: ColDef) => {
      if (el.colId.startsWith('Col')) {
        newColumnIndex += 1
      }
    })
    column.splice(index + 1, 0, { field: `Col${newColumnIndex}` })
    this.props.api.setColumnDefs(column)

    const newRow: Array<{ [key: string]: string }> = []
    this.props.api.getModel().forEachNode((rowNode: RowNode) => {
      const rowList = Object.entries(rowNode.data).map((el: RowData) => {
        if (el[0] != undefined) {
          return {
            [el[0]]: el[1],
          }
        }
      })
      rowList.splice(index + 1, 0, { [`Col${newColumnIndex}`]: '' })
      const row = Object.assign({}, ...rowList)
      newRow.push(row)
    })

    //console.log('newRow', newRow)

    this.props.tableEditor.replaceMdFileTable({
      column: column,
      row: newRow,
    })
  }

  deleteColumn() {
    const thisColumn = this.props.column.getColId()
    const columns = this.props.api.getColumnDefs()
    let index: number
    const newColumns = columns.filter((el: ColDef, idx: number) => {
      if (el.colId === thisColumn) {
        index = idx
      }
      return el.colId != thisColumn
    })
    this.props.api.setColumnDefs(newColumns)

    const newRow: Array<{ [key: string]: string }> = []
    this.props.api.getModel().forEachNode((rowNode: RowNode) => {
      const rowList = Object.entries(rowNode.data).map((el: RowData) => {
        return {
          [el[0]]: el[1],
        }
      })
      rowList.splice(index, 1)
      const row = Object.assign({}, ...rowList)
      newRow.push(row)
    })
    const column = this.props.api.getColumnDefs()

    this.props.tableEditor.replaceMdFileTable({
      column: column,
      row: newRow,
    })
  }

  render() {
    const label = this.state.isEditing ? (
      <input
        type="text"
        ref={this.inputRef}
        value={this.state.newColumnName}
        onChange={this.handleInputChange}
        onKeyDown={this.handleInputExit}
        onBlur={this.handleInputBlur}
      />
    ) : (
      this.props.displayName
    )

    return (
      <div
        className="custom-header-label"
        onContextMenu={this.handleContextMenu}
        onDoubleClick={this.handleDoubleClick}
      >
        {label}
      </div>
    )
  }
}

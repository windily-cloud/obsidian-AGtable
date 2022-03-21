import React, { Component, MouseEventHandler, RefObject } from 'react'
import { ColumnEventType, IFilterParams, RowNode } from 'ag-grid-community'
import { ColDef } from 'ag-grid-community'
import { App } from 'obsidian'
import TableEditor from 'tableEditor'

interface Props extends IFilterParams {
  app: App
  tableId: string
  tableEditor: TableEditor
}
interface RowData {
  [key: string]: string
}
export default class CustomFilter extends Component<Props> {
  private inputRef: RefObject<HTMLInputElement>
  constructor(props: Props) {
    super(props)
    this.inputRef = React.createRef()
    this.addColumn = this.addColumn.bind(this)
    this.deleteColumn = this.deleteColumn.bind(this)
    this.renameColumn = this.renameColumn.bind(this)
  }

  doesFilterPass(params: any) {
    return true
  }

  isFilterActive() {
    return true
  }

  // this example isn't using getModel() and setModel(),
  // so safe to just leave these empty. don't do this in your code!!!
  getModel() {}

  setModel() {}

  renameColumn() {
    const newName = this.inputRef.current.value
    const thisColumn = this.props.column.getColId()
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
      console.log(rowNode.data)
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
    console.log(newRow)
    this.props.api.setRowData(newRow)

    const column = this.props.api.getColumnDefs()
    const tableString = this.props.tableEditor.dataGridToMarkdownTable({
      column: column,
      row: newRow,
    })
    this.props.tableEditor.replaceMdFileTable({
      column: column,
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
      if (el.colId.startsWith('column')) {
        newColumnIndex += 1
      }
    })
    column.splice(index + 1, 0, { field: `column ${newColumnIndex}` })

    this.props.api.setColumnDefs(column)

    const newRow: Array<{ [key: string]: string }> = []
    this.props.api.getModel().forEachNode((rowNode: RowNode) => {
      const rowList = Object.entries(rowNode.data).map((el: RowData) => {
        return {
          [el[0]]: el[1],
        }
      })
      rowList.splice(index + 1, 0, { [`column ${newColumnIndex}`]: '' })
      const row = Object.assign({}, ...rowList)
      newRow.push(row)
    })

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
    return (
      <div id="column-menu">
        <div>
          <input
            ref={this.inputRef}
            type="text"
            placeholder={this.props.colDef.field}
          />
          <label onClick={this.renameColumn}>confirm</label>
        </div>
        <div onClick={this.addColumn}>Add a column</div>
        <div onClick={this.deleteColumn}>Delete this column</div>
      </div>
    )
  }
}

import { ColDef, IHeaderParams } from 'ag-grid-community'
import Database from 'database'
import { Notice } from 'obsidian'
import React, { useEffect, useRef, useState } from 'react'
import { TableData } from 'types'

interface HeaderParams extends IHeaderParams {
  database: Database
  tableId: string
  setColumnDefs: React.Dispatch<React.SetStateAction<ColDef<any>[]>>
}

export default (props: HeaderParams) => {
  const refButton = useRef(null)
  const refInput = useRef(null)
  const [editable, setEditable] = useState(false)
  const [columnName, setColumnName] = useState(props.displayName)
  const [sortStatus, setSortStatus] = useState(props.column.getSort())

  const onMenuClicked = (event: React.MouseEvent<HTMLDivElement>) => {
    // event.preventDefault()
    // event.stopPropagation()
    props.showColumnMenu(refButton.current)
  }

  const handleDoubleClick = () => {
    setEditable(true)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColumnName(event.target.value)
  }

  const handleInputBlur = () => {
    changeColumnName()
    setEditable(false)
  }

  const handleInputExit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === 'Escape') {
      changeColumnName()
      setEditable(false)
    }
  }

  const changeColumnName = () => {
    const selectedColName = props.column.getColId()
    const tableData = props.database.getTableByUID(props.tableId) as TableData
    const isColumnNameExist = tableData.columnDef.some((col) => {
      return col.field === columnName
    })
    if (isColumnNameExist) {
      new Notice('Column Name cannot repeat!')
      return
    }
    const newTableData = props.database.changeColumnName(
      props.tableId,
      selectedColName,
      columnName
    )
    props.setColumnDefs(newTableData.columnDef)
    props.api.setRowData(newTableData.rowData)
  }

  let sort = null
  const onSortRequested = (event: any) => {
    if (props.column.isSortNone()) {
      props.setSort('asc', event.shiftKey)
      setSortStatus('asc')
    } else if (props.column.isSortAscending()) {
      props.setSort('desc', event.shiftKey)
      setSortStatus('desc')
    } else if (props.column.isSortDescending()) {
      props.setSort(null, event.shiftKey)
      setSortStatus(null)
    } else {
      props.setSort(null, event.shiftKey)
      setSortStatus(null)
    }
  }
  if (props.enableSorting) {
    if (!sortStatus) {
      sort = (
        <div
          onClick={(event) => onSortRequested(event)}
          onTouchEnd={(event) => onSortRequested(event)}
        >
          <i className="ag-icon ag-icon-none"></i>
        </div>
      )
    } else if (sortStatus === 'asc') {
      sort = (
        <div
          onClick={(event) => onSortRequested(event)}
          onTouchEnd={(event) => onSortRequested(event)}
        >
          <i className="ag-icon ag-icon-asc"></i>
        </div>
      )
    } else if (sortStatus === 'desc') {
      sort = (
        <div
          onClick={(event) => onSortRequested(event)}
          onTouchEnd={(event) => onSortRequested(event)}
        >
          <i className="ag-icon ag-icon-desc"></i>
        </div>
      )
    }
  }

  let label = null
  label = editable ? (
    <input
      type="text"
      id="agtable-input"
      ref={refInput}
      value={columnName}
      onChange={handleInputChange}
      onKeyDown={handleInputExit}
      onBlur={handleInputBlur}
    />
  ) : (
    props.displayName
  )

  useEffect(() => {
    let isUnmount = false
    if (refInput.current && !isUnmount) {
      refInput.current.focus()
    }
    return () => {
      isUnmount = true
    }
  }, [editable])

  return (
    <div className="agtable-header" onDoubleClick={handleDoubleClick}>
      <div className="agtable-header-label">{label}</div>
      {sort}
      <div
        ref={refButton}
        className="agtable-header-menu"
        onClick={onMenuClicked}
      >
        <i className="ag-icon ag-icon-menu"></i>
      </div>
    </div>
  )
}

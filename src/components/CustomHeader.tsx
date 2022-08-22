import { ColDef, IHeaderParams } from 'ag-grid-community'
import Database from 'database'
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
    const tableData = props.database.getTableByUID(props.tableId) as TableData
    const newColumnDef = tableData.columnDef.map((col) => {
      if (col.field === props.column.getColId()) {
        col.field = columnName
      }
      return col
    })
    tableData.columnDef = newColumnDef
    props.setColumnDefs(newColumnDef)
    props.database.updateTable(props.tableId, tableData)
  }

  const label = editable ? (
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
    if (refInput.current) {
      refInput.current.focus()
    }
  }, [editable])

  return (
    <div className="agtable-header" onDoubleClick={handleDoubleClick}>
      <div className="agtable-header-label">{label}</div>
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

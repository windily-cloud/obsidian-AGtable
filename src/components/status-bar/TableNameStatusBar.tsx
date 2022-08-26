import React, { useState } from 'react'
import { IStatusPanelParams } from 'ag-grid-community'
import GenericInputPrompt from '../prompt/GenericInputPrompt'
import Database from 'database'
import { TableData } from 'types'

interface Props extends IStatusPanelParams {
  database: Database
  tableId: string
}

export default (props: Props) => {
  const tableData = props.database.getTableByUID(props.tableId) as TableData
  const [tableName, setTableName] = useState(tableData.tableInfo.name)

  const modifyTableName = async () => {
    const newTableName = await GenericInputPrompt.Prompt(
      app,
      'Table new name:',
      tableName
    )
    setTableName(newTableName)
    tableData.tableInfo.name = newTableName
    props.database.updateTable(props.tableId, tableData)
  }

  return (
    <span
      className="agtable-table-name"
      aria-label="Double click to change table name"
      onDoubleClick={modifyTableName}
    >
      {tableName}
    </span>
  )
}

import { ICellRendererParams } from 'ag-grid-community'
import React from 'react'

const URLCellRenderer = (props: ICellRendererParams) => {
  const cellValue = props.value
  const regx = /(?<!!)\[(.*?)\]\((.*?)\)/g
  const result = regx.exec(cellValue)
  let linkComponent = null
  if (result) {
    linkComponent = <a href={result[2]}>{result[1]}</a>
  } else {
    linkComponent = cellValue
  }

  return <span>{linkComponent}</span>
}

export default URLCellRenderer

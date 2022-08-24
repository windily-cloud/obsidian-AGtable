import { ICellRendererParams } from 'ag-grid-community'
import { Notice } from 'obsidian'
import React from 'react'
import { hoverFile } from 'utils'

const FileCellRenderer = (props: ICellRendererParams) => {
  const cellValue = props.value
  if (!cellValue) {
    return <span className="cm-hmd-internal-link"></span>
  }
  //@ts-ignore
  const filePath = app.metadataCache.getLinkpathDest(cellValue, '')[0]

  const handleClickFileName = () => {
    if (filePath) {
      app.workspace.getUnpinnedLeaf().openFile(filePath)
    } else {
      new Notice('File does not exist!')
    }
  }

  const handleHover = (event: any) => {
    hoverFile(event, filePath)
  }

  let linkComponent = null
  if (filePath) {
    linkComponent = (
      <span
        className="cm-underline"
        onMouseOver={(event) => {
          handleHover(event)
        }}
        onClick={() => {
          handleClickFileName()
        }}
      >
        {cellValue}
      </span>
    )
  } else {
    linkComponent = (
      <span className="cm-underline is-unresolved">{cellValue}</span>
    )
  }

  return <span className="cm-hmd-internal-link">{linkComponent}</span>
}

export default FileCellRenderer

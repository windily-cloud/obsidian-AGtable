import { IHeaderParams } from 'ag-grid-community'
import React, { useEffect, useRef, useState } from 'react'

export default (props: IHeaderParams) => {
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
    setEditable(false)
  }

  const handleInputExit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === 'Escape') {
      setEditable(false)
    }
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
      <div className="agtable-header-label">
        {label}
      </div>
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

import { ICellRendererParams } from 'ag-grid-community'
import React from 'react'

const TagsCellRenderer = (props: ICellRendererParams) => {
  const cellValue = props.value
  let tagsList = null
  if (cellValue) {
    const tags = String(props.value).split(' ')

    tagsList = tags.map((tag: string, index: number) => {
      return (
        <span
          className="cm-hashtag cm-hashtag-end cm-meta"
          key={`${tag}-${index}`}
        >
          {tag}
        </span>
      )
    })
  } else {
    tagsList = ''
  }

  return tagsList
}

export default TagsCellRenderer

import { ICellRendererParams } from 'ag-grid-community'
import React from 'react'

const TagsCellRenderer = (props: ICellRendererParams) => {
  const cellValue = props.value
  let tagsList = null
  if (cellValue) {
    const tags = String(props.value).split(' ')

    tagsList = tags.map((tag: string) => {
      return (
        <>
          <span
            className="cm-formatting cm-formatting-hashtag cm-hashtag cm-hashtag-begin cm-meta"
            key={`tag`}
          ></span>
          <span className="cm-hashtag cm-hashtag-end cm-meta">{tag}</span>
        </>
      )
    })
  } else {
    tagsList = ''
  }

  return tagsList
}

export default TagsCellRenderer

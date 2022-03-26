import { ICellRendererParams } from 'ag-grid-community'
import React, { Component, createRef } from 'react'
import { MarkdownRenderer } from 'obsidian'

interface Props extends ICellRendererParams {}

export default class CustomCellRenderer extends Component<Props> {
  cellRef: React.RefObject<HTMLSpanElement>
  constructor(props: Props) {
    super(props)
    this.cellRef = createRef()
    MarkdownRenderer.renderMarkdown(
      this.props.value,
      this.cellRef.current,
      '',
      null
    )
  }

  formatCell(): string {
    let result = undefined
    if (/\[\[.*\]\]/.test(this.props.value)) {
      result = this.props.value.replace(/\[\[(.*)\]\]/, `<a href="$1">$1</a>`)
      return result
    } else if (/!\[.*\]\(.*\)/.test(this.props.value)) {
      result = this.props.value.replace(/!\[.*\]\((.*)\)/, `<img src='$1'/>`)
    } else {
      result = this.props.value
    }
    return result
  }

  render() {
    return <span ref={this.cellRef}></span>
  }
}

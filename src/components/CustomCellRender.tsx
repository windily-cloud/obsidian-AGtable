import { ICellRendererParams } from 'ag-grid-community'
import React, { Component, createRef } from 'react'
import { MarkdownRenderer } from 'obsidian'

interface Props extends ICellRendererParams {}

export default class CustomCellRenderer extends Component<Props> {
  cellRef: React.RefObject<HTMLSpanElement>
  constructor(props: Props) {
    super(props)
    this.cellRef = createRef()
  }

  async componentDidMount() {
    await MarkdownRenderer.renderMarkdown(
      this.props.value,
      this.cellRef.current,
      '',
      null
    )
  }

  render() {
    return <span ref={this.cellRef}></span>
  }
}

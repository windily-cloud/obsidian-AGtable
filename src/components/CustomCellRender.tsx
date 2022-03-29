import { ICellRendererParams } from 'ag-grid-community'
import React, { Component, createRef } from 'react'
import { MarkdownRenderer } from 'obsidian'

interface Props extends ICellRendererParams {}

export default class CustomCellRenderer extends Component<Props> {
  private cellValue: string
  cellRef: React.RefObject<HTMLSpanElement>
  constructor(props: Props) {
    super(props)
    this.cellRef = createRef()
    this.cellValue = this.props.value.trim()
  }

  async componentDidMount() {
    await MarkdownRenderer.renderMarkdown(
      this.cellValue,
      this.cellRef.current,
      '',
      null
    )
  }

  render() {
    return <span ref={this.cellRef}></span>
  }
}

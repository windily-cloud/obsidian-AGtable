import React from 'react'
import { App } from 'obsidian'
import DataGrid from 'components/DataGrid'
import ErrorBoundary from 'components/ErrorBoundary'
import '../styles/TableView.css'

interface Props {
  app: App
  tableId: string
  tableString: string
  tablePosition: {
    startIndex: number
    endIndex: number
  }
}

export default class TableView extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
  }

  render(): React.ReactNode {
    return (
      <ErrorBoundary>
        <DataGrid
          app={this.props.app}
          tableString={this.props.tableString}
          tableId={this.props.tableId}
          tablePosition = {this.props.tablePosition}
        ></DataGrid>
      </ErrorBoundary>
    )
  }
}

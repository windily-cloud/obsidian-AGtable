import React from 'react'
import { App } from 'obsidian'
import DataGrid from 'components/DataGrid'
import ErrorBoundary from 'components/ErrorBoundary'
import '../styles/TableView.css'
import { AgtableSettings } from 'main'
import Database from 'database'

interface Props {
  settings: AgtableSettings
  tableId: string
  database: Database
}

export default class TableView extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
  }

  render(): React.ReactNode {
    return (
      <ErrorBoundary>
        <DataGrid settings={this.props.settings} tableId={this.props.tableId} database={this.props.database}></DataGrid>
      </ErrorBoundary>
    )
  }
}

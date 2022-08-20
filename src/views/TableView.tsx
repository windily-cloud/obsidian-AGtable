import React from 'react'
import { App } from 'obsidian'
import DataGrid from 'components/DataGrid'
import ErrorBoundary from 'components/ErrorBoundary'
import '../styles/TableView.css'
import { AgtableSettings } from 'main'

interface Props {
  settings: AgtableSettings
}

export default class TableView extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
  }

  render(): React.ReactNode {
    return (
      <ErrorBoundary>
        <DataGrid settings={this.props.settings}></DataGrid>
      </ErrorBoundary>
    )
  }
}

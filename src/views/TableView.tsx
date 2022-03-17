import React from 'react'
import DataGrid from 'components/DataGrid'
import ErrorBoundary from 'components/ErrorBoundary'
import "../styles/TableView.css"

interface Props {
  tableId: string
  tableString: string
}

export default class TableView extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
  }

  render(): React.ReactNode {
    return (
      <ErrorBoundary>
        <DataGrid
          tableString={this.props.tableString}
          tableId={this.props.tableId}
        ></DataGrid>
      </ErrorBoundary>
    )
  }
}

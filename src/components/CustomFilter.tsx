import React, { Component } from 'react';
import { ColumnEventType, IFilterParams } from 'ag-grid-community';

interface Props extends IFilterParams{}

export default class YearFilter extends Component<Props> {
  constructor(props:Props) {
    super(props);
    this.addColumn = this.addColumn.bind(this)
  }

  doesFilterPass(params:any) {
    return true;
  }

  isFilterActive() {
    return true;
  }

  // this example isn't using getModel() and setModel(),
  // so safe to just leave these empty. don't do this in your code!!!
  getModel() {}

  setModel() {}

  addColumn(event:any){
    const columns = this.props.api.getColumnDefs()
    this.props.api.setColumnDefs([...columns, {field: "name"}])
    console.log(this.props.api.forEachNode((item)=>{
      console.log(item.data)
    }))
  }

  deleteColumn(){

  }

  render() {
    return (
      <div className="database-menu">
          <input type="text" placeholder={this.props.colDef.field}/>
          <button onClick={this.addColumn}>Add a column</button>
          <button>Delete this column</button>
      </div>
    );
  }
}
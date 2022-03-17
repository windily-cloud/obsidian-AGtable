import { Plugin, Editor } from 'obsidian'
import { DEFAULT_TABLE } from 'settings'
import React from 'react'
import TableView from 'views/TableView'
import t from 'i18n'
import ReactDOM from 'react-dom'
export default class AgtablePlugin extends Plugin {
  async onload(): Promise<void> {
    console.log(`${t('welcome')}`)

    this.addCommand({
      id: 'create-table',
      name: t('createTable'),
      editorCallback: (editor: Editor) => {
        editor.replaceRange(DEFAULT_TABLE, editor.getCursor())
      },
    })

    this.registerMarkdownCodeBlockProcessor('agtable', (source, el) => {
      const tableId = source.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/
      )[0]
      const tableString = source.replace(
        /tableId:\W[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\W/,
        ''
      )
      console.log(tableId, tableString)
      if (!source && !tableId && !tableString) {
        return
      } else {
        const view = React.createElement(TableView, { tableString, tableId })
        ReactDOM.render(view, el)
      }
    })
  }
}

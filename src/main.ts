import { TableData } from './types/index';
import {
  Plugin,
  MarkdownPostProcessorContext,
  Notice,
  Editor,
  parseYaml,
} from 'obsidian'
import React from 'react'
import TableView from 'views/TableView'
import t from 'i18n'
import ReactDOM from 'react-dom'
import { createNewTable, getTableByUID } from 'database'

export interface AgtableSettings {
  baseURL?: string
  token?: string
}

const DEFAULT_SETTINGS = {
  baseURL: "http://obsidian-nocodb.herokuapp.com",
  token: "V77hO9tBwV0URSoUU6qbcU-2RQ7f_CM2DCs91dq2",
}

export default class AgtablePlugin extends Plugin {
  settings: AgtableSettings
  async onload(): Promise<void> {
    console.log(`${t('welcome')}`)
    this.loadSettings()

    this.addCommand({
      id: 'add-new-agtable',
      name: 'add new agtable',
      editorCallback: async (editor: Editor) => {
        const uid = await createNewTable()
        if (!uid) {
          new Notice("Exist uid, please tell developer")
        }
        const tableString = `\`\`\`agtable\ntableId: ${uid}\n\`\`\``
        editor.replaceRange(tableString, editor.getCursor())
      }
    })

    this.registerMarkdownCodeBlockProcessor('agtable', async (source: string, el: HTMLElement, context: MarkdownPostProcessorContext) => {
      if (!source) {
        return
      }
      const yaml = parseYaml(source)
      const tableData = await getTableByUID(yaml.tableId)
      if (!tableData) {
        return
      }
      const view = React.createElement(TableView, { settings: this.settings, tableId: yaml.tableId })

      ReactDOM.render(view, el)
    })
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async onunload(): Promise<void> {
  }
}

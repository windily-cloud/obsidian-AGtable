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
import Database from 'database'

export interface AgtableSettings {
  databaseName: string
}

const DEFAULT_SETTINGS = {
  databaseName: 'agtable.json'
}

export default class AgtablePlugin extends Plugin {
  settings: AgtableSettings
  database: Database
  async onload(): Promise<void> {
    console.log(`${t('welcome')}`)
    this.loadSettings()
    this.database = new Database()

    this.addCommand({
      id: 'add-new-agtable',
      name: 'add new agtable',
      editorCallback: async (editor: Editor) => {
        const uid = this.database.createNewTable()
        if (!uid) {
          new Notice("Exist uid, it's not your fault, please tell developer to fix it")
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
      const tableData = this.database.getTableByUID(yaml.tableId)
      if (!tableData) {
        return
      }
      const view = React.createElement(TableView, { settings: this.settings, tableId: yaml.tableId, database: this.database })

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

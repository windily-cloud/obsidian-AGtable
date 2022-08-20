import {
  Plugin,
  MarkdownPostProcessorContext,
} from 'obsidian'
import React from 'react'
import TableView from 'views/TableView'
import t from 'i18n'
import ReactDOM from 'react-dom'

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

    this.registerMarkdownCodeBlockProcessor('agtable', (source: string, el: HTMLElement, context: MarkdownPostProcessorContext) => {
      // if (!source) {
      //   return
      // }

      const view = React.createElement(TableView, { settings: this.settings })

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

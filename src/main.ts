import { Plugin, Editor, MarkdownPostProcessorContext, App } from 'obsidian'
import { DEFAULT_TABLE } from 'settings'
import React from 'react'
import TableView from 'views/TableView'
import t from 'i18n'
import ReactDOM from 'react-dom'
import GenericInputPrompt from 'components/GenericInputPrompt'
import { initTableBySize } from 'utils'
export default class AgtablePlugin extends Plugin {
  async onload(): Promise<void> {
    console.log(`${t('welcome')}`)

    this.addCommand({
      id: 'create-table',
      name: t('createTable'),
      editorCallback: async (editor: Editor) => {
        const tableSize = await GenericInputPrompt.Prompt(
          this.app,
          t('promptHeader'),
          t('promptPlaceholder'),
          '4x3'
        )
        const tableString = initTableBySize(tableSize)
        //console.log(tableString)
        editor.replaceRange(tableString, editor.getCursor())
      },
    })

    this.registerMarkdownCodeBlockProcessor(
      'agtable',
      (
        source: string,
        el: HTMLElement,
        context: MarkdownPostProcessorContext
      ) => {
        const tableId = source.split('\n')[0].split(':')[1].trim()
        const tableString = source
          .split('\n')
          .filter((el: string) => {
            return el
          })
          .slice(1)
          .join('\n')

        console.log(tableId, tableString)
        const tableIdCount = context
          .getSectionInfo(el)
          .text.split('\n')
          .filter((el) => {
            return (
              el.includes('tableId:') && el.split(':')[1].trim() === tableId
            )
          }).length
        //console.log(tableIdCount)

        if (!source || !tableId || !tableString || tableIdCount != 1) {
          console.log(
            `%cagtable format:\n
          tableId: id(unique ID for same MD document)
          |**|**|**|
          |--|--|--|
          |**|**|**|
          `,
            'color:#d96363'
          )

          const view = React.createElement(
            'p',
            {
              style: { color: '#d96363' },
            },
            'Agtable format error! Please check out console for details!'
          )
          ReactDOM.render(view, el)
        } else {
          const view = React.createElement(TableView, {
            app: this.app,
            tableString,
            tableId,
          })
          ReactDOM.render(view, el)
        }
      }
    )
  }

  public static async inputPrompt(
    app: App,
    header: string,
    placeholder?: string,
    value?: string
  ) {
    try {
      return await GenericInputPrompt.Prompt(app, header, placeholder, value)
    } catch {
      return undefined
    }
  }

  async onunload(): Promise<void> {
    document.getElementById('table-menu-container').remove()
  }
}

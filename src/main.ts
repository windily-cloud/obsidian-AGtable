import {
  Plugin,
  Editor,
  MarkdownPostProcessorContext,
  App,
  Menu,
  MenuItem,
} from 'obsidian'
import { DEFAULT_TABLE } from 'settings'
import React from 'react'
import TableView from 'views/TableView'
import t from 'i18n'
import ReactDOM from 'react-dom'
import GenericInputPrompt from 'components/GenericInputPrompt'
import { generateUID, initTableBySize } from 'utils'
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

    this.addCommand({
      id: 'convert-to-Agtable',
      name: t('convertToAgtable'),
      editorCallback: async (editor: Editor) => {
        this.convertToAgtable(editor)
      },
    })

    this.registerEvent(
      this.app.workspace.on('editor-menu', (menu: Menu, editor: Editor) => {
        menu.addItem((item: MenuItem) => {
          item
            .setTitle(t('convertToAgtable'))
            .setIcon('down-curly-arrow-glyph')
            .onClick((evt: MouseEvent) => {
              this.convertToAgtable(editor)
            })
        })
      })
    )

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

        //console.log(tableId, tableString)
        const tableIdCount = context
          .getSectionInfo(el)
          .text.split('\n')
          .filter((el) => {
            return (
              el.includes('tableId:') && el.split(':')[1].trim() === tableId
            )
          }).length
        //console.log(tableIdCount)
        const isTableExist = tableIdCount === 0 || tableIdCount === 1
        //console.log(isTableExist)
        if (!source || !tableId || !tableString || !isTableExist) {
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
            'Agtable format error! Please refresh or check out console for details!'
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

  convertToAgtable(editor: Editor) {
    let selection = editor.getSelection()
    if (!selection) {
      let startCursor = undefined
      let endCursor = undefined
      let { line } = editor.getCursor()
      if (!!editor.getLine(line).trim()) {
        let lineAbove = Math.max(line - 1, 0)
        if (!!editor.getLine(lineAbove).trim()) {
          while (lineAbove > 0 && !!editor.getLine(lineAbove - 1).trim()) {
            lineAbove--
          }
        } else {
          lineAbove = line
        }

        let lineBelow = Math.min(line + 1, editor.lineCount() - 1)
        if (!!editor.getLine(lineBelow).trim()) {
          while (
            lineBelow + 1 < editor.lineCount() &&
            !!editor.getLine(lineBelow + 1).trim()
          ) {
            lineBelow++
          }
        } else {
          lineBelow = line
        }

        startCursor = { line: lineAbove, ch: 0 }
        endCursor = {
          line: lineBelow,
          ch: editor.getLine(lineBelow).length,
        }
        editor.setSelection(startCursor, endCursor)
        selection = editor.getRange(startCursor, endCursor)
      }
    }
    const tableId = generateUID()
    //console.log(selection)
    const wrapSelection =
      '```agtable\n' + `tableId: ${tableId}\n` + selection + '\n```\n'
    editor.replaceSelection(wrapSelection)
  }

  async onunload(): Promise<void> {
    document.getElementById('table-menu-container').remove()
  }
}

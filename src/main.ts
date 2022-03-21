import { Plugin, Editor, MarkdownPostProcessorContext } from 'obsidian'
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

    this.registerMarkdownCodeBlockProcessor(
      'agtable',
      (
        source: string,
        el: HTMLElement,
        context: MarkdownPostProcessorContext
      ) => {
        const tableId = source.match(
          /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/
        )[0]
        const tableString = source.replace(
          /tableId:\W[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\W/,
          ''
        )
        const tableIdLineIndex = context
          .getSectionInfo(el)
          .text.split('\n')
          .findIndex((el) => {
            return el.includes(tableId)
          })
        const codebLockLength = source.split('\n').length
        const tablePosition = {
          startIndex: tableIdLineIndex + 1,
          endIndex: tableIdLineIndex + codebLockLength - 1,
        }
        // const codeBlockList = this.app.metadataCache.getFileCache(
        //   context.sourcePath
        // ).sections
        // console.log(codeBlockList)
        // const codeBlockPosition = codeBlockList.filter((el) => {
        //   const startPosition = el.position.start.line as number
        //   const activeView = this.app.workspace.activeLeaf.view as MarkdownView
        //   const tableIdLine = activeView.editor.getLine(startPosition + 1)
        //   console.log(tableIdLine)
        //   return el.type === 'code'
        // })
        //console.log(el, context, context.getSectionInfo(el))
        //console.log(tableId, tableString)
        if (!source && !tableId && !tableString) {
          return
        } else {
          const view = React.createElement(TableView, {
            app: this.app,
            tableString,
            tableId,
            tablePosition,
          })
          ReactDOM.render(view, el)
        }
      }
    )
  }

  async onunload(): Promise<void> {
    document.getElementById('table-menu-container').remove()
  }
}

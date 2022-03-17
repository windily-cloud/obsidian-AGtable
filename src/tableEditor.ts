import { App } from 'obsidian'

export default class tableEditor {
  app: App
  tableId: string

  private async replaceTable(tableId: string, tableString: string) {
    const fileContent = await this.app.vault.cachedRead(this.app.workspace.getActiveFile())
    const replaceReg = new RegExp(`(?<=tableId:\\s${tableId}\\s)[\\w\\W]*(?=\\W+\`\`\`)`)
    const newFileContent = fileContent.replace(replaceReg, tableString)
    this.app.vault.modify(this.app.workspace.getActiveFile(), newFileContent)
  }

  


}


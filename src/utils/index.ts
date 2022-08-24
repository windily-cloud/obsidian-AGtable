import { moment } from 'obsidian'
export function generateUID() {
  return moment().format('YYMMDDhhmmss')
}

export function isDarkMode(): boolean {
  return Array.from(document.body.classList).includes('theme-dark')
}

export const hoverFile = (e: MouseEvent, item: any): void => {
  const targetEl = e.target as HTMLElement;

  if (!e.ctrlKey && !e.metaKey) return;

  app.workspace.trigger('hover-link', {
    event: e,
    source: 'multi-file-explorer-view',
    hoverParent: targetEl.parentElement,
    targetEl,
    linktext: item.name,
    sourcePath: item.path,
  });
}

export function csvToObject(csvString: string) {
  const csvarry = csvString.split("\n");
  let datas = [];
  let headers = csvarry[0].split(",");
  for (var i = 1; i < csvarry.length; i++) {
    var data = {};
    var temp = csvarry[i].split(",");
    for (var j = 0; j < temp.length; j++) {
      data[headers[j]] = temp[j];
    }
    datas.push(data);
  }
  return datas;
}
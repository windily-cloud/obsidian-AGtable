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
  const csvArr = csvString.split("\n");
  let datas = [];
  let headers = csvArr[0].split(",");
  for (var i = 1; i < csvArr.length; i++) {
    var data = {};
    var temp = csvArr[i].split(",");
    for (var j = 0; j < temp.length; j++) {
      data[headers[j]] = temp[j];
    }
    datas.push(data);
  }
  return datas;
}

export function excelToObject(excelString: string) {
  const excelArr = excelString.split("\n")
  let datas = []
  let headers = excelArr[0].split("\t")
  for (var i = 1; i < excelArr.length; i++) {
    var data = {};
    var temp = excelArr[i].split("\t");
    for (var j = 0; j < temp.length; j++) {
      data[headers[j]] = temp[j];
    }
    datas.push(data);
  }
  return datas;
}
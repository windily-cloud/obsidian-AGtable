import { moment } from 'obsidian'
export function generateUID() {
  return moment().format('YYMMDDhhmmss')
}

export function isDarkMode(): boolean {
  return Array.from(document.body.classList).includes('theme-dark')
}

export const hoverFile = (e: MouseEvent, item: any):void => {
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
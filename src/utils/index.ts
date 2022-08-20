import { moment } from 'obsidian'
export function generateUID() {
  return moment().format('YYMMDDhhmmss')
}

export function isDarkMode(): boolean {
  return Array.from(document.body.classList).includes('theme-dark')
}
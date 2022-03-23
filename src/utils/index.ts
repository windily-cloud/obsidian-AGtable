import { moment } from 'obsidian'
export function generateUID() {
  return moment().format('YYMMDDhhmmss')
}

export function isObjShallowEqual(
  obj1: { [index: string]: string },
  obj2: { [index: string]: string }
) {
  const keys1 = Object.getOwnPropertyNames(obj1)
  const keys2 = Object.getOwnPropertyNames(obj2)
  if (keys1.length !== keys2.length) {
    return false
  }
  const flag = keys1.every((key) => {
    const type = typeof obj1[key]
    if (['function', 'array', 'object'].includes(type)) {
      return type === typeof obj2[key]
    }

    if (obj1[key] !== obj2[key]) {
      return false
    }
    return true
  })
  return flag
}

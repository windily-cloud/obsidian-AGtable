export function generateRandomStr(length: number) {
  let result = ''
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-.~!@#$%^&*()_:<>?'
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

export function generateUUID() {
  var temp_url = URL.createObjectURL(new Blob())
  var uuid = temp_url.toString() // blob:https://xxx.com/b250d159-e1b6-4a87-9002-885d90033be3
  URL.revokeObjectURL(temp_url)
  return uuid.substr(uuid.lastIndexOf('/') + 1)
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

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

export function parseMarkdownTable(
  tableString: string
): Array<string[]> | void {
  if (tableString) {
    tableString = tableString.trim()

    const lines = tableString.split('\n')
    if (lines.length < 2) {
      return
    }

    let headers = lines[0].split('|')
    headers = headers.splice(1, headers.length - 2)

    if (headers.length <= 1) {
      return
    }

    let rows
    if (lines.length > 2) {
      rows = lines.splice(2).map((line: string) => line.split('|'))
    }

    for (let idx = 0; idx < rows.length; idx++) {
      rows[idx] = rows[idx].splice(1, rows[idx].length - 2)
    }

    const result: string[][] = []
    for (let i = 0; i < rows.length + 1; i++) {
      const data = i === 0 ? headers : rows[i - 1]
      const rowResult = []
      for (let colIdx = 0; colIdx < data.length; colIdx++) {
        rowResult.push(data[colIdx].trim())
      }
      result.push(rowResult)
    }

    return result
  }

  return
}

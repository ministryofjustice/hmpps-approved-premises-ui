import type { Request } from 'express'

export const getSearchOptions = <T>(request: Request, keys: Array<string>): T => {
  const searchOptions = {}

  keys.forEach(key => {
    const option = request.query?.[key]
    if (option) {
      searchOptions[key] = option
    }
  })

  return searchOptions as T
}

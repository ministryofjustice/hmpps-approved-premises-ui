import { LostBed } from '@approved-premises/api'
import { EntityType } from '../../server/@types/ui'

const getCombinations = (arr: Array<string>) => {
  const result: Array<Array<string>> = []
  arr.forEach(item => {
    result.push([item])
    const index = arr.indexOf(item) + 1
    for (let i = index; i < arr.length; i += 1) {
      const group = [item, ...arr.slice(index, i + 1)]
      result.push(group)
    }
  })
  return result.sort((a, b) => b.length - a.length)
}

const errorStub = (fields: Array<string>, pattern: string, method: 'PUT' | 'POST' = 'POST') => {
  const bodyPatterns = fields.map(field => {
    return {
      matchesJsonPath: {
        expression: `$.${field}`,
        absent: '(absent)',
      },
    }
  })

  const invalidParams = fields.map(field => {
    return {
      propertyName: `$.${field}`,
      errorType: 'empty',
    }
  })

  return {
    request: {
      method,
      urlPathPattern: pattern,
      bodyPatterns,
    },
    response: {
      status: 400,
      headers: {
        'Content-Type': 'application/problem+json;charset=UTF-8',
      },
      jsonBody: {
        type: 'https://example.net/validation-error',
        title: 'Invalid request parameters',
        code: 400,
        'invalid-params': invalidParams,
      },
    },
  }
}

const bedspaceConflictResponseBody = (entityId: string | LostBed, entityType: EntityType) => ({
  title: 'Conflict',
  status: 409,
  detail: `${entityType === 'booking' ? 'Booking' : 'out-of-service bed'}: ${entityId}`,
})

export { getCombinations, errorStub, bedspaceConflictResponseBody }

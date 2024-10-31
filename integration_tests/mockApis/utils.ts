import { LostBed } from '@approved-premises/api'
import { EntityType } from '@approved-premises/ui'

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

export { errorStub, bedspaceConflictResponseBody }

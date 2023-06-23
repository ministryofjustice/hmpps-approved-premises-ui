import { createMock } from '@golevelup/ts-jest'
import { Request, Response } from 'express'
import logger from '../../logger'
import AuditService from '../services/auditService'
import { auditMiddleware } from './auditMiddleware'

jest.mock('../../logger')

const username = 'username'
const requestParams = { param1: 'value-1', param2: 'value-2' }
const auditEvent = 'SOME_AUDIT_EVENT'

describe('auditMiddleware', () => {
  it('returns the given request handler when no audit events are specified', async () => {
    const handler = jest.fn()

    const auditService = createMock<AuditService>()

    const auditedhandler = auditMiddleware(handler, auditService)

    expect(auditedhandler).toEqual(handler)
  })

  it('returns an audited request handler, that forwards call on to the given request handler', async () => {
    const handler = jest.fn()
    const response = createMock<Response>({ locals: { user: { name: username } } })
    const request = createMock<Request>()
    const next = jest.fn()

    const auditService = createMock<AuditService>()

    const auditedhandler = auditMiddleware(handler, auditService, { auditEvent })

    await auditedhandler(request, response, next)

    expect(handler).toHaveBeenCalled()
  })

  it('returns an audited request handler, the redirects to /authError if there is no user name', async () => {
    const handler = jest.fn()
    const response = createMock<Response>({ locals: { user: {} } })
    const request = createMock<Request>()
    const next = jest.fn()

    const auditService = createMock<AuditService>()

    const auditedhandler = auditMiddleware(handler, auditService, { auditEvent })

    await auditedhandler(request, response, next)

    expect(handler).not.toHaveBeenCalled()
    expect(response.redirect).toHaveBeenCalledWith('/authError')
    expect(logger.error).toHaveBeenCalledWith('User without a username is attempting to access an audited path')
  })

  it('returns an audited request handler, that sends an audit message that includes the request parameters', async () => {
    const handler = jest.fn()
    const response = createMock<Response>({ locals: { user: { name: username } } })
    const request = createMock<Request>({ params: requestParams })
    const next = jest.fn()

    const auditService = createMock<AuditService>()

    const auditedhandler = auditMiddleware(handler, auditService, { auditEvent })

    await auditedhandler(request, response, next)

    expect(handler).toHaveBeenCalled()
    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditEvent, username, requestParams)
  })

  it('returns an audited request handler, that sends an audit message that includes selected request body parameters', async () => {
    const handler = jest.fn()
    const response = createMock<Response>({ locals: { user: { name: username } } })
    const request = createMock<Request>({
      params: requestParams,
      body: { bodyParam1: 'body-value-1', bodyParam2: 'body-value-2', bodyParam3: 'body-value-3' },
    })
    const next = jest.fn()

    const auditService = createMock<AuditService>()

    const auditedhandler = auditMiddleware(handler, auditService, {
      auditEvent,
      auditBodyParams: ['bodyParam1', 'bodyParam2'],
    })

    await auditedhandler(request, response, next)

    expect(handler).toHaveBeenCalled()
    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditEvent, username, {
      ...requestParams,
      bodyParam1: 'body-value-1',
      bodyParam2: 'body-value-2',
    })
  })

  it('ignores empty request body parameters', async () => {
    const handler = jest.fn()
    const response = createMock<Response>({ locals: { user: { name: username } } })
    const request = createMock<Request>({
      params: requestParams,
      body: { bodyParam1: 'body-value-1', bodyParam2: '' },
    })
    const next = jest.fn()

    const auditService = createMock<AuditService>()

    const auditedhandler = auditMiddleware(handler, auditService, {
      auditEvent,
      auditBodyParams: ['bodyParam1', 'bodyParam2'],
    })

    await auditedhandler(request, response, next)

    expect(handler).toHaveBeenCalled()
    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditEvent, username, {
      ...requestParams,
      bodyParam1: 'body-value-1',
    })
  })
})

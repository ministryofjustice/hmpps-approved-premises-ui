import { createMock } from '@golevelup/ts-jest'
import { Request, Response } from 'express'

import applicationAuthMiddleware from './applicationAuthMiddleware'
import { userDetailsFactory } from '../testutils/factories'
import logger from '../../logger'

jest.mock('../../logger')

describe('applicationAuthMiddleware', () => {
  const handler = jest.fn()
  const request = createMock<Request>()
  const next = jest.fn()

  it('returns the handler when there are no allowedRoles specified', async () => {
    const response = createMock<Response>()

    const auditedhandler = applicationAuthMiddleware(handler, {})

    await auditedhandler(request, response, next)

    expect(handler).toHaveBeenCalled()
  })

  it('returns the handler when there are allowedRoles specified and the user has one of those roles', async () => {
    const user = userDetailsFactory.build({ roles: ['manager'] })
    const response = createMock<Response>({ locals: { user } })

    const auditedhandler = applicationAuthMiddleware(handler, { allowedRoles: ['manager', 'matcher'] })

    await auditedhandler(request, response, next)

    expect(handler).toHaveBeenCalledWith(request, response, next)
  })

  it('redirects with an error when the user does not have the correct roles', async () => {
    const user = userDetailsFactory.build({ roles: ['role_admin'] })
    const response = createMock<Response>({ locals: { user } })

    const loggerSpy = jest.spyOn(logger, 'error')

    const auditedhandler = applicationAuthMiddleware(handler, { allowedRoles: ['manager', 'matcher'] })

    await auditedhandler(request, response, next)

    expect(loggerSpy).toHaveBeenCalledWith('User is not authorised to access this')
    expect(response.status).toHaveBeenCalledWith(401)
    expect(response.render).toHaveBeenCalledWith('roleError')
  })
})

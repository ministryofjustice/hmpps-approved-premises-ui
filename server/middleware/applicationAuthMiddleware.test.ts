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

  it('returns the handler when there are no allowedRoles or allowedPermissions specified', async () => {
    const response = createMock<Response>()

    const auditedhandler = applicationAuthMiddleware(handler, {})

    await auditedhandler(request, response, next)

    expect(handler).toHaveBeenCalled()
  })

  it('returns the handler when there are allowedRoles specified and the user has one of those roles', async () => {
    const user = userDetailsFactory.build({ roles: ['future_manager'] })
    const response = createMock<Response>({ locals: { user } })

    const auditedhandler = applicationAuthMiddleware(handler, { allowedRoles: ['future_manager', 'appeals_manager'] })

    await auditedhandler(request, response, next)

    expect(handler).toHaveBeenCalledWith(request, response, next)
  })

  it('redirects with an error when the user does not have the correct roles', async () => {
    const user = userDetailsFactory.build({ roles: ['user_manager'] })
    const response = createMock<Response>({ locals: { user } })

    const loggerSpy = jest.spyOn(logger, 'error')

    const auditedhandler = applicationAuthMiddleware(handler, { allowedRoles: ['future_manager', 'appeals_manager'] })

    await auditedhandler(request, response, next)

    expect(loggerSpy).toHaveBeenCalledWith('User is not authorised to access this')
    expect(response.status).toHaveBeenCalledWith(401)
    expect(response.render).toHaveBeenCalledWith('roleError')
  })

  it('returns the handler when there are allowedPermissions specified and the user has one of those permissions', async () => {
    const user = userDetailsFactory.build({ permissions: ['cas1_space_booking_create'] })
    const response = createMock<Response>({ locals: { user } })

    const auditedHandler = applicationAuthMiddleware(handler, {
      allowedRoles: [],
      allowedPermissions: ['cas1_space_booking_view', 'cas1_space_booking_withdraw', 'cas1_space_booking_create'],
    })

    await auditedHandler(request, response, next)

    expect(handler).toHaveBeenCalledWith(request, response, next)
  })

  it('redirects with an error when the user does not have the correct permission', async () => {
    const user = userDetailsFactory.build({ roles: ['user_manager'], permissions: ['cas1_space_booking_create'] })
    const response = createMock<Response>({ locals: { user } })

    const loggerSpy = jest.spyOn(logger, 'error')

    const auditedhandler = applicationAuthMiddleware(handler, {
      allowedRoles: [],
      allowedPermissions: ['cas1_space_booking_withdraw', 'cas1_space_booking_view'],
    })

    await auditedhandler(request, response, next)

    expect(loggerSpy).toHaveBeenCalledWith('User is not authorised to access this')
    expect(response.status).toHaveBeenCalledWith(401)
    expect(response.render).toHaveBeenCalledWith('roleError')
  })

  it('redirects with an error if the user does not have the role and no required permissions are specified', async () => {
    const user = userDetailsFactory.build({ roles: [], permissions: ['cas1_space_booking_create'] })
    const response = createMock<Response>({ locals: { user } })

    const loggerSpy = jest.spyOn(logger, 'error')

    const auditedhandler = applicationAuthMiddleware(handler, {
      allowedRoles: ['future_manager'],
    })

    await auditedhandler(request, response, next)

    expect(loggerSpy).toHaveBeenCalledWith('User is not authorised to access this')
    expect(response.status).toHaveBeenCalledWith(401)
    expect(response.render).toHaveBeenCalledWith('roleError')
  })
})

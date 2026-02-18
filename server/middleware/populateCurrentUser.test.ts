import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { UserService } from '../services'
import populateCurrentUser from './populateCurrentUser'
import { userDetailsFactory } from '../testutils/factories'
import logger from '../../logger'
import { DeliusAccountMissingStaffDetailsError, UnsupportedProbationRegionError } from '../services/userService'
import inMemoryStore from '../inMemoryStore'

jest.mock('../../logger')

describe('populateCurrentUser', () => {
  const token = 'SOME_TOKEN'

  let userService: DeepMocked<UserService>

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  let next: DeepMocked<NextFunction>

  const user = userDetailsFactory.build({ active: true })

  beforeEach(() => {
    userService = createMock<UserService>()

    request = createMock<Request>({})
    response = createMock<Response>({ locals: { user: { token } } })
    next = jest.fn()
  })

  afterEach(() => {
    inMemoryStore.users = {}
    jest.resetAllMocks()
  })

  it('should populate the current user from the API if the user is not in the session', async () => {
    ;(userService.getActingUser as jest.Mock).mockResolvedValue(user)

    const middleware = populateCurrentUser(userService)
    const requestWithSession = {...request,session:{...request.session,user:undefined as typeof request.session.user}}

    await middleware(requestWithSession, response, next)

    expect(userService.getActingUser).toHaveBeenCalledWith(token)

    expect(requestWithSession.session.user).toEqual(user)
    expect(response.locals.user).toEqual({ ...response.locals.user, ...user })

    expect(next).toHaveBeenCalled()
  })

  it('should populate the current user from the API if the version hash has changed', async () => {
    ;(userService.getActingUser as jest.Mock).mockResolvedValue(user)
    inMemoryStore.users[user.id] = 'old-version'
    request.session.user = user

    const middleware = populateCurrentUser(userService)

    await middleware(request, response, next)

    expect(userService.getActingUser).toHaveBeenCalledWith(token)

    expect(request.session.user).toEqual(user)
    expect(response.locals.user).toEqual({ ...response.locals.user, ...user })

    expect(next).toHaveBeenCalled()
  })

  it('should populate the current user from the session if the version hash has not changed', async () => {
    request.session.user = user
    inMemoryStore.users[user.id] = user.version

    const middleware = populateCurrentUser(userService)
    await middleware(request, response, next)

    expect(userService.getActingUser).not.toHaveBeenCalled()

    expect(request.session.user).toEqual(user)
    expect(response.locals.user).toEqual({ ...response.locals.user, ...user })

    expect(next).toHaveBeenCalled()
  })

  it('should redirect to an autherror if no user is available', async () => {
    ;(userService.getActingUser as jest.Mock).mockResolvedValue(undefined)

    const middleware = populateCurrentUser(userService)

    await middleware(request, response, next)

    expect(userService.getActingUser).toHaveBeenCalledWith(token)
    expect(response.redirect).toHaveBeenCalledWith('/autherror')
    expect(logger.info).toHaveBeenCalledWith('No user available')
  })

  it('should redirect to an autherror if the user is inactive', async () => {
    user.active = false
    ;(userService.getActingUser as jest.Mock).mockResolvedValue(user)

    const middleware = populateCurrentUser(userService)

    await middleware(request, response, next)

    expect(userService.getActingUser).toHaveBeenCalledWith(token)
    expect(response.redirect).toHaveBeenCalledWith('/autherror')
    expect(logger.error).toHaveBeenCalledWith(`User is inactive: ${user.id}`)
  })

  it('should catch an error when an error is raised', async () => {
    const err = new Error()

    ;(userService.getActingUser as jest.Mock).mockImplementation(() => {
      throw err
    })

    const middleware = populateCurrentUser(userService)

    await middleware(request, response, next)

    expect(userService.getActingUser).toHaveBeenCalledWith(token)
    expect(next).toHaveBeenCalledWith(err)
  })

  it('should call next when there is no token', async () => {
    response.locals.user.token = null

    const middleware = populateCurrentUser(userService)

    await middleware(request, response, next)

    expect(next).toHaveBeenCalled()
  })

  it('redirects to a specific error page if the user account is missing a staff record', async () => {
    ;(userService.getActingUser as jest.Mock).mockImplementation(() => {
      throw new DeliusAccountMissingStaffDetailsError()
    })

    const middleware = populateCurrentUser(userService)

    await middleware(request, response, next)

    expect(response.redirect).toHaveBeenCalledWith('/deliusMissingStaffDetails')
    expect(logger.error).toHaveBeenCalledWith('Delius account missing staff details')
  })

  it('redirects to a specific error page if the user account has an unsupported probation region', async () => {
    ;(userService.getActingUser as jest.Mock).mockImplementation(() => {
      throw new UnsupportedProbationRegionError()
    })

    const middleware = populateCurrentUser(userService)

    await middleware(request, response, next)

    expect(response.redirect).toHaveBeenCalledWith('/unsupported-probation-region')
    expect(logger.error).toHaveBeenCalledWith('Unsupported probation region')
  })
})

import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { UserService } from '../../services'

import UserManagementController from './userManagementController'
import { qualifications, roles } from '../../utils/users'
import { userFactory } from '../../testutils/factories'
import paths from '../../paths/admin'

describe('UserManagementController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let userManagementController: UserManagementController
  let userService: DeepMocked<UserService>

  beforeEach(() => {
    userService = createMock<UserService>()
    userManagementController = new UserManagementController(userService)
    jest.resetAllMocks()
  })

  describe('index', () => {
    it('renders the index page with all the users', async () => {
      const users = userFactory.buildList(1)

      userService.getUsers.mockResolvedValue(users)

      const requestHandler = userManagementController.index()

      await requestHandler(request, response, next)

      expect(userService.getUsers).toHaveBeenCalledWith(token)
      expect(response.render).toHaveBeenCalledWith('admin/users/index', {
        pageHeading: 'User management dashboard',
        users,
      })
    })
  })

  describe('search', () => {
    it('calls the service method with the query and renders the index template with the result', async () => {
      const users = userFactory.buildList(1)
      userService.search.mockResolvedValue(users)
      const name = 'name'

      const requestHandler = userManagementController.search()
      await requestHandler({ ...request, body: { name } }, response, next)

      expect(userService.search).toHaveBeenCalledWith(token, name)
      expect(response.render).toHaveBeenCalledWith('admin/users/index', {
        pageHeading: 'User management dashboard',
        users,
        name,
      })
    })
  })

  describe('edit', () => {
    it('renders an individual user page', async () => {
      const user = userFactory.build()

      userService.getUserById.mockResolvedValue(user)

      const requestHandler = userManagementController.edit()

      request.params = { id: user.id }

      await requestHandler(request, response, next)

      expect(userService.getUserById).toHaveBeenCalledWith(token, user.id)
      expect(response.render).toHaveBeenCalledWith('admin/users/edit', {
        pageHeading: 'Manage permissions',
        user,
        roles,
        qualifications,
      })
    })
  })

  describe('update', () => {
    it('updates the user with the selected roles and qualifications', async () => {
      const user = userFactory.build({
        qualifications: [],
        roles: [],
      })
      const updatedRoles = {
        allocationRoles: ['excluded_from_assess_allocation'],
        roles: ['assessor', 'matcher'],
      }
      const updatedUser = {
        ...user,
        qualifications: ['emergency'],
        roles: [...updatedRoles.roles, ...updatedRoles.allocationRoles],
      }
      userService.getUserById.mockResolvedValue(user)
      const flash = jest.fn()

      const requestHandler = userManagementController.update()
      await requestHandler(
        {
          ...request,
          flash,
          body: {
            roles: updatedRoles.roles,
            allocationPreferences: updatedRoles.allocationRoles,
            qualifications: updatedUser.qualifications,
          },
          params: { id: user.id },
        },
        response,
        next,
      )

      expect(userService.getUserById).toHaveBeenCalledWith(token, user.id)
      expect(userService.updateUser).toHaveBeenCalledWith(token, updatedUser)
      expect(response.redirect).toHaveBeenCalledWith(paths.admin.userManagement.edit({ id: user.id }))
      expect(flash).toHaveBeenCalledWith('success', 'User updated')
    })
  })
})

import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { ApAreaService, UserService } from '../../services'

import UserManagementController from './userManagementController'
import { qualifications, roles } from '../../utils/users'
import { apAreaFactory, paginatedResponseFactory, userFactory } from '../../testutils/factories'
import paths from '../../paths/admin'
import { PaginatedResponse } from '../../@types/ui'
import { ApprovedPremisesUser } from '../../@types/shared'
import { getPaginationDetails } from '../../utils/getPaginationDetails'

jest.mock('../../utils/getPaginationDetails')

describe('UserManagementController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let userManagementController: UserManagementController
  let userService: DeepMocked<UserService>
  let apAreaService: DeepMocked<ApAreaService>

  beforeEach(() => {
    userService = createMock<UserService>()
    apAreaService = createMock<ApAreaService>()
    userManagementController = new UserManagementController(userService, apAreaService)
    jest.resetAllMocks()
  })

  describe('index', () => {
    const paginationDetails = {
      hrefPrefix: paths.admin.userManagement.index({}),
      pageNumber: 1,
      sortBy: 'name',
      sortDirection: 'desc',
    }

    let paginatedResponse: PaginatedResponse<ApprovedPremisesUser>
    let users: Array<ApprovedPremisesUser>

    beforeEach(() => {
      users = userFactory.buildList(1)
      paginatedResponse = paginatedResponseFactory.build({
        data: users,
      }) as PaginatedResponse<ApprovedPremisesUser>
      ;(getPaginationDetails as jest.Mock).mockReturnValue(paginationDetails)
      userService.getUsers.mockResolvedValue(paginatedResponse)
    })

    it('renders the index page with all the users', async () => {
      const requestHandler = userManagementController.index()

      await requestHandler(request, response, next)

      expect(userService.getUsers).toHaveBeenCalledWith(
        token,
        undefined,
        [],
        [],
        paginationDetails.pageNumber,
        paginationDetails.sortBy,
        paginationDetails.sortDirection,
      )

      expect(response.render).toHaveBeenCalledWith('admin/users/index', {
        pageHeading: 'User management dashboard',
        users,
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        sortBy: paginationDetails.sortBy,
        sortDirection: paginationDetails.sortDirection,
      })
      expect(getPaginationDetails).toHaveBeenCalledWith(request, paths.admin.userManagement.index({}), {
        role: undefined,
        qualification: undefined,
        selectedArea: undefined,
      })
    })

    it('should render the template with AP Areas based on the current user token', async () => {
      const apAreas = apAreaFactory.buildList(1)

      apAreaService.getApAreas.mockResolvedValue(apAreas)

      const requestHandler = userManagementController.index()
      await requestHandler(request, response, next)

      expect(apAreaService.getApAreas).toHaveBeenCalledWith(token)
      expect(response.render).toHaveBeenCalledWith('admin/users/index', {
        pageHeading: 'User management dashboard',
        users,
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        sortBy: paginationDetails.sortBy,
        sortDirection: paginationDetails.sortDirection,
        apAreas,
      })
    })

    it('filters users by AP area', async () => {
      const requestWithQuery = { ...request, query: { area: '1234' } }
      const requestHandler = userManagementController.index()

      await requestHandler(requestWithQuery, response, next)

      expect(userService.getUsers).toHaveBeenCalledWith(
        token,
        '1234',
        [],
        [],
        paginationDetails.pageNumber,
        paginationDetails.sortBy,
        paginationDetails.sortDirection,
      )

      expect(response.render).toHaveBeenCalledWith('admin/users/index', {
        pageHeading: 'User management dashboard',
        users,
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        sortBy: paginationDetails.sortBy,
        sortDirection: paginationDetails.sortDirection,
        selectedArea: '1234',
      })
      expect(getPaginationDetails).toHaveBeenCalledWith(requestWithQuery, paths.admin.userManagement.index({}), {
        role: undefined,
        qualification: undefined,
        area: '1234',
      })
    })

    it('filters users by role', async () => {
      const requestWithQuery = { ...request, query: { role: 'assessor' } }
      const requestHandler = userManagementController.index()

      await requestHandler(requestWithQuery, response, next)

      expect(userService.getUsers).toHaveBeenCalledWith(
        token,
        undefined,
        ['assessor'],
        [],
        paginationDetails.pageNumber,
        paginationDetails.sortBy,
        paginationDetails.sortDirection,
      )

      expect(response.render).toHaveBeenCalledWith('admin/users/index', {
        pageHeading: 'User management dashboard',
        users,
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        sortBy: paginationDetails.sortBy,
        sortDirection: paginationDetails.sortDirection,
        selectedRole: 'assessor',
      })
      expect(getPaginationDetails).toHaveBeenCalledWith(requestWithQuery, paths.admin.userManagement.index({}), {
        role: 'assessor',
        qualification: undefined,
        area: undefined,
      })
    })

    it('filters users by qualification', async () => {
      const requestWithQuery = { ...request, query: { qualification: 'esap' } }
      const requestHandler = userManagementController.index()

      await requestHandler(requestWithQuery, response, next)

      expect(userService.getUsers).toHaveBeenCalledWith(
        token,
        undefined,
        [],
        ['esap'],
        paginationDetails.pageNumber,
        paginationDetails.sortBy,
        paginationDetails.sortDirection,
      )

      expect(response.render).toHaveBeenCalledWith('admin/users/index', {
        pageHeading: 'User management dashboard',
        users,
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        sortBy: paginationDetails.sortBy,
        sortDirection: paginationDetails.sortDirection,
        selectedQualification: 'esap',
      })
      expect(getPaginationDetails).toHaveBeenCalledWith(requestWithQuery, paths.admin.userManagement.index({}), {
        role: undefined,
        qualification: 'esap',
        area: undefined,
      })
    })

    it('applies more than one filter', async () => {
      const requestWithQuery = { ...request, query: { qualification: 'esap', role: 'assessor' } }
      const requestHandler = userManagementController.index()

      await requestHandler(requestWithQuery, response, next)

      expect(userService.getUsers).toHaveBeenCalledWith(
        token,
        undefined,
        ['assessor'],
        ['esap'],
        paginationDetails.pageNumber,
        paginationDetails.sortBy,
        paginationDetails.sortDirection,
      )

      expect(response.render).toHaveBeenCalledWith('admin/users/index', {
        pageHeading: 'User management dashboard',
        users,
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        sortBy: paginationDetails.sortBy,
        sortDirection: paginationDetails.sortDirection,
        selectedQualification: 'esap',
        selectedRole: 'assessor',
      })
      expect(getPaginationDetails).toHaveBeenCalledWith(requestWithQuery, paths.admin.userManagement.index({}), {
        role: 'assessor',
        qualification: 'esap',
        area: undefined,
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

      expect(userService.updateUser).toHaveBeenCalledWith(token, user.id, {
        roles: [...updatedRoles.roles, ...updatedRoles.allocationRoles],
        qualifications: updatedUser.qualifications,
      })
      expect(response.redirect).toHaveBeenCalledWith(paths.admin.userManagement.edit({ id: user.id }))
      expect(flash).toHaveBeenCalledWith('success', 'User updated')
    })
  })

  describe('confirmDelete', () => {
    it('calls the service method to retrieve the user and renders the deletion confirmation page', async () => {
      const user = userFactory.build()
      userService.getUserById.mockResolvedValue(user)

      const requestHandler = userManagementController.confirmDelete()

      await requestHandler({ ...request, params: { id: user.id } }, response, next)

      expect(userService.getUserById).toHaveBeenCalledWith(token, user.id)
      expect(response.render).toHaveBeenCalledWith('admin/users/confirmDelete', {
        pageHeading: "Confirm user's access to AP service should be removed",
        user,
      })
    })
  })

  describe('delete', () => {
    it('calls the service method to retrieve the user and renders the deletion confirmation page', async () => {
      const flashSpy = jest.fn()
      const user = userFactory.build()

      const requestHandler = userManagementController.delete()

      await requestHandler({ ...request, params: { id: user.id }, flash: flashSpy }, response, next)

      expect(userService.delete).toHaveBeenCalledWith(token, user.id)
      expect(flashSpy).toHaveBeenCalledWith('success', 'User deleted')
      expect(response.redirect).toHaveBeenCalledWith(paths.admin.userManagement.index({}))
    })
  })
})

import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { CruManagementAreaService, UserService } from '../../services'

import UserManagementController from './userManagementController'
import { qualifications, roles } from '../../utils/users'
import { cruManagementAreaFactory, paginatedResponseFactory, userFactory } from '../../testutils/factories'
import paths from '../../paths/admin'
import { PaginatedResponse } from '../../@types/ui'
import { ApprovedPremisesUser } from '../../@types/shared'
import { getPaginationDetails } from '../../utils/getPaginationDetails'

jest.mock('../../utils/getPaginationDetails')

describe('UserManagementController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token }, session: {} })
  const response = createMock<Response>({ locals: { user: { token } } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let userManagementController: UserManagementController
  let userService: DeepMocked<UserService>
  let cruManagementAreaService: DeepMocked<CruManagementAreaService>

  beforeEach(() => {
    userService = createMock<UserService>()
    cruManagementAreaService = createMock<CruManagementAreaService>()
    userManagementController = new UserManagementController(userService, cruManagementAreaService)
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
        undefined,
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

    it('should render the template with CRU management areas based on the current user token', async () => {
      const cruManagementAreas = cruManagementAreaFactory.buildList(3)

      cruManagementAreaService.getCruManagementAreas.mockResolvedValue(cruManagementAreas)

      const requestHandler = userManagementController.index()
      await requestHandler(request, response, next)

      expect(cruManagementAreaService.getCruManagementAreas).toHaveBeenCalledWith(token)
      expect(response.render).toHaveBeenCalledWith('admin/users/index', {
        pageHeading: 'User management dashboard',
        users,
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        sortBy: paginationDetails.sortBy,
        sortDirection: paginationDetails.sortDirection,
        cruManagementAreas,
      })
    })

    it('filters users by CRU Management area', async () => {
      const requestWithQuery = { ...request, query: { area: '1234' } }
      const requestHandler = userManagementController.index()

      await requestHandler(requestWithQuery, response, next)

      expect(userService.getUsers).toHaveBeenCalledWith(
        token,
        '1234',
        [],
        [],
        undefined,
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
        undefined,
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
        undefined,
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
        nameOrEmail: undefined,
        area: undefined,
      })
    })

    it('filters users by name or email', async () => {
      const requestWithQuery = { ...request, query: { nameOrEmail: 'Harry' } }
      const requestHandler = userManagementController.index()

      await requestHandler(requestWithQuery, response, next)

      expect(userService.getUsers).toHaveBeenCalledWith(
        token,
        undefined,
        [],
        [],
        'Harry',
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
        nameOrEmail: 'Harry',
      })
      expect(getPaginationDetails).toHaveBeenCalledWith(requestWithQuery, paths.admin.userManagement.index({}), {
        role: undefined,
        qualification: undefined,
        nameOrEmail: 'Harry',
        area: undefined,
      })
    })

    it('applies more than one filter', async () => {
      const requestWithQuery = { ...request, query: { qualification: 'esap', role: 'assessor', nameOrEmail: 'David' } }
      const requestHandler = userManagementController.index()

      await requestHandler(requestWithQuery, response, next)

      expect(userService.getUsers).toHaveBeenCalledWith(
        token,
        undefined,
        ['assessor'],
        ['esap'],
        'David',
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
        nameOrEmail: 'David',
      })
      expect(getPaginationDetails).toHaveBeenCalledWith(requestWithQuery, paths.admin.userManagement.index({}), {
        role: 'assessor',
        qualification: 'esap',
        nameOrEmail: 'David',
        area: undefined,
      })
    })
  })

  describe('edit', () => {
    it('renders an individual user page', async () => {
      const cruManagementAreas = cruManagementAreaFactory.buildList(2)
      const updateUser = userFactory.build({ cruManagementAreaOverride: undefined })

      userService.getUserById.mockResolvedValue(updateUser)
      cruManagementAreaService.getCruManagementAreas.mockResolvedValue(cruManagementAreas)

      const requestHandler = userManagementController.edit()

      request.params = { id: updateUser.id }

      await requestHandler(request, response, next)

      expect(userService.getUserById).toHaveBeenCalledWith(token, updateUser.id)
      expect(cruManagementAreaService.getCruManagementAreas).toHaveBeenCalledWith(token)
      expect(response.render).toHaveBeenCalledWith('admin/users/edit', {
        pageHeading: 'Manage permissions',
        updateUser,
        roles,
        qualifications,
        cruManagementAreasOptions: [
          {
            text: 'None',
            value: '',
            selected: true,
          },
          {
            text: cruManagementAreas[0].name,
            value: cruManagementAreas[0].id,
            selected: false,
          },
          {
            text: cruManagementAreas[1].name,
            value: cruManagementAreas[1].id,
            selected: false,
          },
        ],
      })
    })

    describe('when the user has a CRU management area assigned', () => {
      it('renders the assigned CRU management area as selected', async () => {
        const cruManagementAreas = cruManagementAreaFactory.buildList(2)
        const updateUser = userFactory.build({ cruManagementAreaOverride: cruManagementAreas[1] })

        userService.getUserById.mockResolvedValue(updateUser)
        cruManagementAreaService.getCruManagementAreas.mockResolvedValue(cruManagementAreas)

        const requestHandler = userManagementController.edit()

        request.params = { id: updateUser.id }

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'admin/users/edit',
          expect.objectContaining({
            cruManagementAreasOptions: [
              {
                text: 'None',
                value: '',
                selected: false,
              },
              {
                text: cruManagementAreas[0].name,
                value: cruManagementAreas[0].id,
                selected: false,
              },
              {
                text: cruManagementAreas[1].name,
                value: cruManagementAreas[1].id,
                selected: true,
              },
            ],
          }),
        )
      })
    })
  })

  describe('update', () => {
    it('updates the user with the selected CRU management area, roles and qualifications', async () => {
      const user = userFactory.build({
        qualifications: [],
        roles: [],
        cruManagementAreaOverride: undefined,
      })
      const updatedRoles = {
        allocationRoles: ['excluded_from_assess_allocation'],
        roles: ['assessor', 'appeals_manager'],
      }
      const updatedCruManagementArea = cruManagementAreaFactory.build()
      const updatedUser = {
        ...user,
        qualifications: ['emergency'],
        roles: [...updatedRoles.roles, ...updatedRoles.allocationRoles],
        cruManagementAreaOverride: updatedCruManagementArea,
      }
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
            cruManagementAreaOverrideId: updatedCruManagementArea.id,
          },
          params: { id: user.id },
        },
        response,
        next,
      )

      expect(userService.updateUser).toHaveBeenCalledWith(token, user.id, {
        roles: [...updatedRoles.roles, ...updatedRoles.allocationRoles],
        qualifications: updatedUser.qualifications,
        cruManagementAreaOverrideId: updatedCruManagementArea.id,
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

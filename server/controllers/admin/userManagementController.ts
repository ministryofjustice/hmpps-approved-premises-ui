import type { Request, Response, TypedRequestHandler } from 'express'
import { qualifications, roles } from '../../utils/users'
import { ApAreaService, CruManagementAreaService, UserService } from '../../services'
import paths from '../../paths/admin'
import { flattenCheckboxInput } from '../../utils/formUtils'
import { UserQualification, ApprovedPremisesUserRole as UserRole, UserSortField } from '../../@types/shared'
import { getPaginationDetails } from '../../utils/getPaginationDetails'
import { userCRUManagementAreasSelectOptions } from '../../utils/users/userManagement'

export default class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly apAreaService: ApAreaService,
    private readonly cruManagementAreaService: CruManagementAreaService,
  ) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const role = req.query.role as UserRole
      const qualification = req.query.qualification as UserQualification
      const selectedArea = req.query.area as string

      const { pageNumber, sortBy, sortDirection, hrefPrefix } = getPaginationDetails<UserSortField>(
        req,
        paths.admin.userManagement.index({}),
        { role, qualification, area: selectedArea },
      )

      const usersResponse = await this.userService.getUsers(
        req.user.token,
        selectedArea,
        [role],
        [qualification],
        pageNumber,
        sortBy,
        sortDirection,
      )

      const apAreas = await this.apAreaService.getApAreas(req.user.token)

      res.render('admin/users/index', {
        pageHeading: 'User management dashboard',
        users: usersResponse.data,
        apAreas,
        pageNumber: Number(usersResponse.pageNumber),
        totalPages: Number(usersResponse.totalPages),
        hrefPrefix,
        sortBy,
        sortDirection,
        selectedArea,
        selectedQualification: qualification,
        selectedRole: role,
      })
    }
  }

  edit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const user = await this.userService.getUserById(req.user.token, req.params.id)
      const cruManagementAreas = await this.cruManagementAreaService.getCRUManagementAreas(req.user.token)

      res.render('admin/users/edit', {
        pageHeading: 'Manage permissions',
        user,
        cruManagementAreasOptions: userCRUManagementAreasSelectOptions(
          cruManagementAreas,
          user.cruManagementAreaOverride?.id,
        ),
        roles,
        qualifications,
      })
    }
  }

  update(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      await this.userService.updateUser(req.user.token, req.params.id, {
        roles: [...flattenCheckboxInput(req.body.roles), ...flattenCheckboxInput(req.body.allocationPreferences)],
        qualifications: flattenCheckboxInput(req.body.qualifications),
        cruManagementAreaOverrideId: req.body.cruManagementAreaOverrideId,
      })

      req.flash('success', 'User updated')
      res.redirect(paths.admin.userManagement.edit({ id: req.params.id }))
    }
  }

  search(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const users = await this.userService.search(req.user.token, req.body.name as string)
      const apAreas = await this.apAreaService.getApAreas(req.user.token)

      res.render('admin/users/index', { pageHeading: 'User management dashboard', users, apAreas, name: req.body.name })
    }
  }

  confirmDelete(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const user = await this.userService.getUserById(req.user.token, req.params.id)

      res.render('admin/users/confirmDelete', {
        pageHeading: "Confirm user's access to AP service should be removed",
        user,
      })
    }
  }

  delete(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      await this.userService.delete(req.user.token, req.params.id)

      req.flash('success', 'User deleted')
      res.redirect(paths.admin.userManagement.index({}))
    }
  }
}

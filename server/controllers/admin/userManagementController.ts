import type { Request, Response, TypedRequestHandler } from 'express'
import { qualifications, roles } from '../../utils/users'
import { UserService } from '../../services'
import paths from '../../paths/admin'
import { flattenCheckboxInput } from '../../utils/formUtils'
import { UserQualification, ApprovedPremisesUserRole as UserRole, UserSortField } from '../../@types/shared'
import { getPaginationDetails } from '../../utils/getPaginationDetails'

export default class UserController {
  constructor(private readonly userService: UserService) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const role = req.query.roles as UserRole
      const qualification = req.query.qualifications as UserQualification
      const region = req.query.region as string

      const { pageNumber, sortBy, sortDirection, hrefPrefix } = getPaginationDetails<UserSortField>(
        req,
        paths.admin.userManagement.index({}),
      )

      const usersResponse = await this.userService.getUsers(
        req.user.token,
        region,
        [role],
        [qualification],
        pageNumber,
        sortBy,
        sortDirection,
      )
      const regions = await this.userService.getProbationRegions(req.user.token)
      res.render('admin/users/index', {
        pageHeading: 'User management dashboard',
        users: usersResponse.data,
        regions,
        pageNumber: Number(usersResponse.pageNumber),
        totalPages: Number(usersResponse.totalPages),
        hrefPrefix,
        sortBy,
        sortDirection,
        selectedQualification: qualification,
        selectedRegion: region,
        selectedRole: role,
      })
    }
  }

  edit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const user = await this.userService.getUserById(req.user.token, req.params.id)

      res.render('admin/users/edit', { pageHeading: 'Manage permissions', user, roles, qualifications })
    }
  }

  update(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      await this.userService.updateUser(req.user.token, req.params.id, {
        roles: [...flattenCheckboxInput(req.body.roles), ...flattenCheckboxInput(req.body.allocationPreferences)],
        qualifications: flattenCheckboxInput(req.body.qualifications),
      })

      req.flash('success', 'User updated')
      res.redirect(paths.admin.userManagement.edit({ id: req.params.id }))
    }
  }

  search(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const users = await this.userService.search(req.user.token, req.body.name as string)
      const regions = await this.userService.getProbationRegions(req.user.token)

      res.render('admin/users/index', { pageHeading: 'User management dashboard', users, regions, name: req.body.name })
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

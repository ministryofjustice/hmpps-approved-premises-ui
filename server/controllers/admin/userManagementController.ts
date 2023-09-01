import type { Request, Response, TypedRequestHandler } from 'express'

import { qualifications, roles } from '../../utils/users'
import { UserService } from '../../services'

export default class UserController {
  constructor(private readonly userService: UserService) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const users = await this.userService.getUsers(req.user.token)

      res.render('admin/users/index', { pageHeading: 'User management dashboard', users })
    }
  }

  edit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const user = await this.userService.getUserById(req.user.token, req.params.id)

      res.render('admin/users/show', { pageHeading: 'Manage permissions', user, roles, qualifications })
    }
  }

  search(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const users = await this.userService.search(req.user.token, req.body.name as string)

      res.render('admin/users/index', { pageHeading: 'User management dashboard', users, name: req.body.name })
    }
  }
}

import type { Request, Response, TypedRequestHandler } from 'express'
import { UserService } from '../../services'

export default class UserController {
  constructor(private readonly userService: UserService) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const users = await this.userService.getUsers(req.user.token)

      res.render('admin/users/index', { pageHeading: 'User management dashboard', users })
    }
  }
}

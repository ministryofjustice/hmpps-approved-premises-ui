import type { Request, Response, TypedRequestHandler } from 'express'
import { UserService } from '../../services'

export default class UserController {
  constructor(private readonly userService: UserService) {}

  new(): TypedRequestHandler<Request, Response> {
    return async (_, res: Response) => {
      res.render('admin/users/new', { pageHeading: 'Find a new user' })
    }
  }

  search(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const user = await this.userService.searchDelius(req.user.token, req.body.username as string)

      res.render('admin/users/confirm', { pageHeading: 'Confirm new user', user })
    }
  }
}

import type { Request, Response, TypedRequestHandler } from 'express'
import { HttpError } from 'http-errors'
import { UserService } from '../../services'
import { addErrorMessageToFlash, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/admin'

export default class UserController {
  constructor(private readonly userService: UserService) {}

  new(): TypedRequestHandler<Request, Response> {
    return async (req, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      res.render('admin/users/new', { pageHeading: 'Find a new user', errors, errorSummary, ...userInput })
    }
  }

  search(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      try {
        const user = await this.userService.searchDelius(req.user.token, req.body.username as string)
        return res.render('admin/users/confirm', { pageHeading: 'Confirm new user', user })
      } catch (error) {
        const knownError = error as HttpError | Error
        if ('data' in knownError && knownError.status === 404) {
          addErrorMessageToFlash(req, 'User not found. Enter the NDelius username as appears on NDelius', 'username')
          return res.redirect(paths.admin.userManagement.new({}))
        }
        throw knownError
      }
    }
  }
}

import type { Request, RequestHandler, Response } from 'express'
import ExampleService from '../services/exampleService'

export default class DashboardController {
  constructor(private readonly exampleService: ExampleService) {}

  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const exampleData = await this.exampleService.getExampleData(res.locals.user.username)

      res.render('pages/index', { exampleData })
    }
  }
}

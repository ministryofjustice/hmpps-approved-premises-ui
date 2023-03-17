import type { Request, Response, TypedRequestHandler } from 'express'
import paths from '../paths/tasks'
import { ApplicationService, TaskService, UserService } from '../services'
import { getQualificationsForApplication } from '../utils/applications/getQualificationsForApplication'
import { groupByAllocation } from '../utils/tasks'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../utils/validation'

export default class TasksController {
  constructor(
    private readonly taskService: TaskService,
    private readonly applicationService: ApplicationService,
    private readonly userService: UserService,
  ) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const tasks = await this.taskService.getAll(req.user.token)

      res.render('tasks/index', { pageHeading: 'Tasks', tasks: groupByAllocation(tasks) })
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const application = await this.applicationService.findApplication(req.user.token, req.params.id)
      const users = await this.userService.getUsers(
        req.user.token,
        ['assessor'],
        getQualificationsForApplication(application),
      )
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      res.render('tasks/allocations/show', {
        pageHeading: `Task for allocation`,
        application,
        users,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }
}

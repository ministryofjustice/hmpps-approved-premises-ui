import type { Request, Response, TypedRequestHandler } from 'express'
import { convertToTitleCase, sentenceCase } from '../utils/utils'
import { ApAreaService, ApplicationService, TaskService } from '../services'
import { fetchErrorsAndUserInput } from '../utils/validation'
import { getPaginationDetails } from '../utils/getPaginationDetails'
import paths from '../paths/api'
import { AllocatedFilter, TaskSortField } from '../@types/shared'

export default class TasksController {
  constructor(
    private readonly taskService: TaskService,
    private readonly applicationService: ApplicationService,
    private readonly apAreaService: ApAreaService,
  ) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const allocatedFilter = (req.query.allocatedFilter as AllocatedFilter) || 'allocated'
      const apAreaId = req.query.areas ? req.query.areas : res.locals.user.apArea?.id
      const {
        pageNumber,
        sortDirection = 'asc',
        sortBy = 'createdAt',
        hrefPrefix,
      } = getPaginationDetails<TaskSortField>(req, paths.tasks.index({}), {
        allocatedFilter,
      })
      const tasks = await this.taskService.getAllReallocatable(
        req.user.token,
        allocatedFilter,
        sortBy,
        sortDirection,
        pageNumber,
        apAreaId,
      )
      const apAreas = await this.apAreaService.getApAreas(req.user.token)

      res.render('tasks/index', {
        pageHeading: 'Tasks',
        tasks: tasks.data,
        allocatedFilter,
        apAreas,
        pageNumber: Number(tasks.pageNumber),
        totalPages: Number(tasks.totalPages),
        hrefPrefix,
        sortBy,
        sortDirection,
        selectedArea: apAreaId,
      })
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const { task, users } = await this.taskService.find(req.user.token, req.params.id, req.params.taskType)
      const application = await this.applicationService.findApplication(req.user.token, task.applicationId)
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      res.render('tasks/show', {
        pageHeading: `Reallocate ${convertToTitleCase(sentenceCase(task.taskType))}`,
        application,
        task,
        users,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }
}

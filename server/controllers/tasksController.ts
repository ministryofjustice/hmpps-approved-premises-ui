import type { Request, Response, TypedRequestHandler } from 'express'
import { convertToTitleCase, sentenceCase } from '../utils/utils'
import { ApAreaService, ApplicationService, TaskService, UserService } from '../services'
import { fetchErrorsAndUserInput } from '../utils/validation'
import { getPaginationDetails } from '../utils/getPaginationDetails'
import paths from '../paths/api'
import { AllocatedFilter, TaskSortField, UserQualification } from '../@types/shared'
import { TaskSearchQualification } from '../@types/ui'

export default class TasksController {
  constructor(
    private readonly taskService: TaskService,
    private readonly applicationService: ApplicationService,
    private readonly apAreaService: ApAreaService,
    private readonly userService: UserService,
  ) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const users = await this.userService.getUserList(req.user.token, ['assessor', 'matcher'])

      const allocatedFilter = (req.query.allocatedFilter as AllocatedFilter) || 'allocated'
      const apAreaId = req.query.area ? req.query.area : res.locals.user.apArea?.id
      const allocatedToUserId = req.query.allocatedToUserId as string
      const requiredQualification = req.query.requiredQualification
        ? (req.query.requiredQualification as TaskSearchQualification)
        : null
      const crnOrName = req.query.crnOrName as string

      const {
        pageNumber,
        sortDirection = 'asc',
        sortBy = 'createdAt',
        hrefPrefix,
      } = getPaginationDetails<TaskSortField>(req, paths.tasks.index({}), {
        allocatedFilter,
        area: apAreaId,
        allocatedToUserId,
        requiredQualification,
        crnOrName,
      })

      const tasks = await this.taskService.getAll({
        token: req.user.token,
        allocatedFilter,
        sortBy,
        sortDirection,
        page: pageNumber,
        apAreaId: apAreaId === 'all' ? '' : apAreaId,
        taskTypes: ['PlacementApplication', 'Assessment'],
        allocatedToUserId,
        requiredQualification,
        crnOrName,
      })

      const apAreas = await this.apAreaService.getApAreas(req.user.token)

      res.render('tasks/index', {
        pageHeading: 'Task Allocation',
        tasks: tasks.data,
        allocatedFilter,
        apAreas,
        pageNumber: Number(tasks.pageNumber),
        totalPages: Number(tasks.totalPages),
        hrefPrefix,
        sortBy,
        sortDirection,
        apArea: apAreaId,
        users,
        allocatedToUserId,
        requiredQualification,
        crnOrName,
      })
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const apAreaId = (req.query.apAreaId as string) || ''
      const qualification = req.query.qualification as UserQualification

      const { task, users } = await this.taskService.find(req.user.token, req.params.id, req.params.taskType, {
        apAreaId,
        qualification,
      })
      const application = await this.applicationService.findApplication(req.user.token, task.applicationId)
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const apAreas = await this.apAreaService.getApAreas(req.user.token)

      res.render('tasks/show', {
        pageHeading: `Reallocate ${convertToTitleCase(sentenceCase(task.taskType))}`,
        application,
        task,
        users,
        errors,
        errorSummary,
        apAreas,
        apAreaId,
        qualification: qualification || '',
        ...userInput,
      })
    }
  }
}

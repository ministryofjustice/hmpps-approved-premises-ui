import type { Request, Response, TypedRequestHandler } from 'express'
import { TaskTab, tasksTableHeader, tasksTableRows } from '../utils/tasks/listTable'
import { convertToTitleCase, sentenceCase } from '../utils/utils'
import { ApplicationService, CruManagementAreaService, TaskService, UserService } from '../services'
import { fetchErrorsAndUserInput } from '../utils/validation'
import { getPaginationDetails } from '../utils/getPaginationDetails'
import paths from '../paths/api'
import { AllocatedFilter, TaskSortField, UserQualification } from '../@types/shared'
import { TaskSearchQualification } from '../@types/ui'
import { userQualificationsSelectOptions } from '../utils/tasks'

export default class TasksController {
  constructor(
    private readonly taskService: TaskService,
    private readonly applicationService: ApplicationService,
    private readonly userService: UserService,
    private readonly cruManagementAreaService: CruManagementAreaService,
  ) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const users = await this.userService.getUserList(req.user.token, ['assessor', 'appeals_manager'])

      const allocatedFilter = (req.query.allocatedFilter as AllocatedFilter) || 'allocated'
      const activeTab = (req.query.activeTab || 'allocated') as TaskTab
      const isCompleted = activeTab === 'completed'

      const cruManagementAreaId = req.query.area || res.locals.user.cruManagementArea?.id
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
        activeTab,
        allocatedFilter,
        area: cruManagementAreaId,
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
        cruManagementAreaId: cruManagementAreaId === 'all' ? '' : cruManagementAreaId,
        taskTypes: ['PlacementApplication', 'Assessment'],
        allocatedToUserId,
        requiredQualification,
        crnOrName,
        isCompleted,
      })

      const cruManagementAreas = await this.cruManagementAreaService.getCruManagementAreas(req.user.token)

      res.render('tasks/index', {
        pageHeading: 'Task Allocation',
        taskRows: tasksTableRows(tasks.data, activeTab),
        taskHeader: tasksTableHeader(activeTab, sortBy, sortDirection, hrefPrefix),
        allocatedFilter,
        pageNumber: Number(tasks.pageNumber),
        totalPages: Number(tasks.totalPages),
        hrefPrefix,
        cruManagementAreas,
        cruManagementArea: cruManagementAreaId,
        users,
        allocatedToUserId,
        crnOrName,
        activeTab,
        userQualificationSelectOptions: userQualificationsSelectOptions(requiredQualification),
      })
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const cruManagementAreaId = (req.query.cruManagementAreaId as string) || ''
      const qualification = req.query.qualification as UserQualification

      const { task, users } = await this.taskService.find(req.user.token, req.params.id, req.params.taskType, {
        cruManagementAreaId,
        qualification,
      })
      const application = await this.applicationService.findApplication(req.user.token, task.applicationId)
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const pageHeading =
        task.taskType === 'PlacementApplication'
          ? 'Reallocate Request for Placement'
          : `Reallocate ${convertToTitleCase(sentenceCase(task.taskType))}`

      const cruManagementAreas = await this.cruManagementAreaService.getCruManagementAreas(req.user.token)

      res.render('tasks/show', {
        pageHeading,
        application,
        task,
        users,
        errors,
        errorSummary,
        cruManagementAreas,
        cruManagementAreaId,
        qualification: qualification || '',
        ...userInput,
      })
    }
  }
}

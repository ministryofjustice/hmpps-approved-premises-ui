import type { Request, Response, TypedRequestHandler } from 'express'
import TaskService from '../services/taskService'
import { groupByAllocation } from '../utils/tasks'

export default class TasksController {
  constructor(private readonly taskService: TaskService) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const tasks = await this.taskService.getAll(req.user.token)

      res.render('tasks/index', { pageHeading: 'Tasks', tasks: groupByAllocation(tasks) })
    }
  }
}

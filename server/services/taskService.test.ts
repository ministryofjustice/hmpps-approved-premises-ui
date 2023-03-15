import { Task } from '../@types/shared'
import TaskClient from '../data/taskClient'
import taskFactory from '../testutils/factories/task'
import TaskService from './taskService'

jest.mock('../data/taskClient.ts')

describe('taskService', () => {
  const taskClient = new TaskClient(null) as jest.Mocked<TaskClient>
  const taskClientFactory = jest.fn()

  const service = new TaskService(taskClientFactory)

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    taskClientFactory.mockReturnValue(taskClient)
  })

  describe('getAll', () => {
    it('calls the all method on the task client', async () => {
      const tasks: Array<Task> = taskFactory.buildList(2)
      taskClient.all.mockResolvedValue(tasks)

      const result = await service.getAll(token)

      expect(result).toEqual(tasks)

      expect(taskClientFactory).toHaveBeenCalledWith(token)
      expect(taskClient.all).toHaveBeenCalled()
    })
  })
})

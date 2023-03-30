import { Task } from '../@types/shared'
import TaskClient from '../data/taskClient'
import { taskFactory, taskWrapperFactory } from '../testutils/factories'
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

  describe('find', () => {
    it('calls the find method on the task client', async () => {
      const applicationId = 'some-application-id'

      const taskWrapper = taskWrapperFactory.build()
      taskClient.find.mockResolvedValue(taskWrapper)

      const result = await service.find(token, applicationId, 'assessment')

      expect(result).toEqual(taskWrapper)

      expect(taskClientFactory).toHaveBeenCalledWith(token)
      expect(taskClient.find).toHaveBeenCalledWith(applicationId, 'assessment')
    })
  })

  describe('createAllocation', () => {
    it('calls the client with the expected arguments', async () => {
      const applicationId = 'some-application-id'
      const userId = 'some-user-id'

      await service.createAllocation(token, applicationId, userId, 'assessment')

      expect(taskClientFactory).toHaveBeenCalledWith(token)
      expect(taskClient.createAllocation).toHaveBeenCalledWith(applicationId, userId, 'assessment')
    })
  })
})

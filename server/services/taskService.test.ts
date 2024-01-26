import { CategorisedTask, PaginatedResponse } from '@approved-premises/ui'
import { Task } from '../@types/shared'
import TaskClient from '../data/taskClient'
import {
  paginatedResponseFactory,
  placementApplicationTaskFactory,
  placementRequestTaskFactory,
  taskFactory,
  taskWrapperFactory,
} from '../testutils/factories'
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

  describe('getAllReallocatable', () => {
    it('calls the all method on the task client', async () => {
      const tasks: Array<Task> = taskFactory.buildList(2)
      const paginatedResponse = paginatedResponseFactory.build({
        data: tasks,
      }) as PaginatedResponse<Task>

      taskClient.allReallocatable.mockResolvedValue(paginatedResponse)

      const result = await service.getAllReallocatable(token, 'allocated', 'createdAt', 'asc', 1, 'testAreaId')

      expect(result).toEqual({
        data: tasks,
        pageNumber: '1',
        pageSize: '10',
        totalPages: '10',
        totalResults: '100',
      })

      expect(taskClientFactory).toHaveBeenCalledWith(token)
      expect(taskClient.allReallocatable).toHaveBeenCalledWith('allocated', 'testAreaId', 1, 'asc', 'createdAt')
    })
  })

  describe('getTasksOfType', () => {
    it('calls the allByType method on the task client', async () => {
      const tasks: Array<Task> = taskFactory.buildList(2)
      const paginatedResponse = paginatedResponseFactory.build({ data: tasks }) as PaginatedResponse<Task>
      taskClient.allByType.mockResolvedValue(paginatedResponse)

      const result = await service.getTasksOfType(token, 'placement-application', 1)

      expect(result).toEqual(paginatedResponse)

      expect(taskClientFactory).toHaveBeenCalledWith(token)
      expect(taskClient.allByType).toHaveBeenCalledWith('placement-application', 1)
    })
  })

  describe('getMatchTasks', () => {
    it('calls the all method on the task client', async () => {
      const applicationTasks = placementApplicationTaskFactory.buildList(1)
      const notMatchedTasks = placementRequestTaskFactory.buildList(1, { placementRequestStatus: 'notMatched' })
      const unableToMatchTasks = placementRequestTaskFactory.buildList(1, { placementRequestStatus: 'unableToMatch' })
      const matchedTasks = placementRequestTaskFactory.buildList(1, { placementRequestStatus: 'matched' })

      const tasks: Array<CategorisedTask> = [applicationTasks, notMatchedTasks, unableToMatchTasks, matchedTasks].flat()

      taskClient.allForUser.mockResolvedValue(tasks)

      const result = await service.getMatchTasks(token)

      expect(result).toEqual({
        notMatched: notMatchedTasks,
        unableToMatch: unableToMatchTasks,
        matched: matchedTasks,
        placementApplications: applicationTasks,
      })

      expect(taskClientFactory).toHaveBeenCalledWith(token)
      expect(taskClient.allForUser).toHaveBeenCalled()
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

      await service.createAllocation(token, applicationId, userId, 'Assessment')

      expect(taskClientFactory).toHaveBeenCalledWith(token)
      expect(taskClient.createAllocation).toHaveBeenCalledWith(applicationId, userId, 'Assessment')
    })
  })
})

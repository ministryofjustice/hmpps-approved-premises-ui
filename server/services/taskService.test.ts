import { CategorisedTask, PaginatedResponse } from '@approved-premises/ui'
import { Task, UserQualification } from '../@types/shared'
import TaskClient from '../data/taskClient'
import {
  cruManagementAreaFactory,
  paginatedResponseFactory,
  placementApplicationTaskFactory,
  placementRequestTaskFactory,
  taskFactory,
  taskWrapperFactory,
  userWithWorkloadFactory,
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

  describe('getAll', () => {
    it('calls the getAll method on the task client', async () => {
      const tasks: Array<Task> = taskFactory.buildList(2)
      const paginatedResponse = paginatedResponseFactory.build({
        data: tasks,
      }) as PaginatedResponse<Task>

      taskClient.getAll.mockResolvedValue(paginatedResponse)

      const result = await service.getAll({
        token,
        allocatedFilter: 'allocated',
        sortBy: 'createdAt',
        sortDirection: 'asc',
        page: 1,
        cruManagementAreaId: 'testAreaId',
        taskTypes: ['PlacementApplication', 'Assessment'],
        requiredQualification: 'emergency',
        crnOrName: 'CRN123',
      })

      expect(result).toEqual({
        data: tasks,
        pageNumber: '1',
        pageSize: '10',
        totalPages: '10',
        totalResults: '100',
      })

      expect(taskClientFactory).toHaveBeenCalledWith(token)
      expect(taskClient.getAll).toHaveBeenCalledWith({
        allocatedFilter: 'allocated',
        cruManagementAreaId: 'testAreaId',
        allocatedToUserId: '',
        page: 1,
        sortDirection: 'asc',
        sortBy: 'createdAt',
        taskTypes: ['PlacementApplication', 'Assessment'],
        requiredQualification: 'emergency',
        crnOrName: 'CRN123',
        isCompleted: false,
      })
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
    const applicationId = 'some-application-id'

    it('calls the find method on the task client', async () => {
      const taskWrapper = taskWrapperFactory.build()
      taskClient.find.mockResolvedValue(taskWrapper)

      const result = await service.find(token, applicationId, 'assessment', {})

      expect(result).toEqual(taskWrapper)

      expect(taskClientFactory).toHaveBeenCalledWith(token)
      expect(taskClient.find).toHaveBeenCalledWith(applicationId, 'assessment')
    })

    it('filters users result by AP area and qualification', async () => {
      const cruManagementArea = cruManagementAreaFactory.build()
      const qualification: UserQualification = 'emergency' as const
      const expectedUser = userWithWorkloadFactory.build({ cruManagementArea, qualifications: [qualification] })
      const users = [...userWithWorkloadFactory.buildList(2), expectedUser]
      const taskWrapper = taskWrapperFactory.build({ users })
      taskClient.find.mockResolvedValue(taskWrapper)

      const result = await service.find(token, applicationId, 'assessment', {
        cruManagementAreaId: cruManagementArea.id,
        qualification,
      })
      expect(result.users).toEqual([expectedUser])
    })

    it('filters users result by only AP Area', async () => {
      const cruManagementArea = cruManagementAreaFactory.build()
      const expectedUser = userWithWorkloadFactory.build({ cruManagementArea })
      const users = [...userWithWorkloadFactory.buildList(2), expectedUser]
      const taskWrapper = taskWrapperFactory.build({ users })
      taskClient.find.mockResolvedValue(taskWrapper)

      const result = await service.find(token, applicationId, 'assessment', {
        cruManagementAreaId: cruManagementArea.id,
      })
      expect(result.users).toEqual([expectedUser])
    })

    it('filters users result by only qualification', async () => {
      const qualification: UserQualification = 'emergency' as const

      const expectedUser = userWithWorkloadFactory.build({ qualifications: [qualification] })
      const anotherUser = userWithWorkloadFactory.build({ qualifications: ['pipe'] })
      const users = [anotherUser, expectedUser]
      const taskWrapper = taskWrapperFactory.build({ users })
      taskClient.find.mockResolvedValue(taskWrapper)

      const result = await service.find(token, applicationId, 'assessment', { qualification })
      expect(result.users).toEqual([expectedUser])
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

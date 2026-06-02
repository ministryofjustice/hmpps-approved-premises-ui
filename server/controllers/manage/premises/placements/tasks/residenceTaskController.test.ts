import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { JourneyType } from '@approved-premises/ui'
import ResidenceTasksController from './residenceTaskController'
import { FormDataService, PlacementService } from '../../../../../services'
import { cas1SpaceBookingFactory } from '../../../../../testutils/factories'
import TasklistService from '../../../../../services/tasklistService'
import paths from '../../../../../paths/manage'

jest.mock('../../../../../services/tasklistService')

describe('ResidenceTaskController', () => {
  const placement = cas1SpaceBookingFactory.build()
  const token = 'test-token'
  const journey: JourneyType = 'pre-arrival'
  const crn = '123456'
  const placementId = 'placement-id'

  const placementService = createMock<PlacementService>()
  const formService = createMock<FormDataService>()

  placementService.getPlacement.mockResolvedValue(placement)

  const residenceTasksController = new ResidenceTasksController(placementService, formService)

  const request: DeepMocked<Request> = createMock<Request>({
    params: { crn, placementId },
    user: { token },
  })
  const response: DeepMocked<Response> = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>()
  formService.getFormData.mockResolvedValue({ taskData: 'task-data' })

  describe('show', () => {
    it('should render the tasklist', async () => {
      await residenceTasksController.show(journey)(request, response, next)

      const rendered = response.render.mock.calls[0]
      expect(rendered[0]).toEqual('manage/resident/pre-arrival/taskList.njk')
      expect(rendered[1]).toEqual(
        expect.objectContaining({
          backlink: '/manage/resident/123456/placement/placement-id',
          placement,
          pageHeading: 'Complete Pre-arrival tasks',
        }),
      )

      expect(formService.getFormData).toHaveBeenCalledWith(token, 'placement-id', 'pre-arrival')
    })
  })

  describe('update', () => {
    afterEach(async () => {
      jest.restoreAllMocks()
      jest.resetAllMocks()
    })

    it('should update the taskList status if the tasks are complete', async () => {
      ;(TasklistService as jest.Mock).mockImplementation(() => ({
        status: 'complete',
      }))

      await residenceTasksController.submit(journey)(request, response, next)

      expect(formService.getFormData).toHaveBeenCalledWith(token, 'placement-id', 'pre-arrival')
      expect(formService.updateFormData).toHaveBeenCalledWith(token, 'placement-id', 'pre-arrival', {
        status: 'submitted',
        taskData: 'task-data',
      })
    })

    it('should throw if the tasks are not complete', async () => {
      ;(TasklistService as jest.Mock).mockImplementation(() => ({
        status: 'incomplete',
      }))

      await residenceTasksController.submit(journey)(request, response, next)

      expect(formService.getFormData).toHaveBeenCalledWith(token, 'placement-id', 'pre-arrival')
      expect(formService.updateFormData).not.toHaveBeenCalled()
      expect(request.flash).toHaveBeenCalledWith('errorSummary', [
        { href: '#tasklist', text: 'The tasks are not complete.' },
      ])
      expect(response.redirect).toHaveBeenCalledWith(paths.resident.taskList({ placementId, crn, journey }))
    })
  })
})

import type { Request, RequestHandler, Response } from 'express'
import { Cas1SpaceBooking } from '@approved-premises/api'
import { JourneyType, TasklistStatus } from '@approved-premises/ui'
import { FormDataService, PlacementService } from '../../../../../services'
import { settlePromises } from '../../../../../utils/utils'
import TasklistService from '../../../../../services/tasklistService'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../../../utils/validation'
import managePaths from '../../../../../paths/manage'

import { ValidationError } from '../../../../../utils/errors'

export const tasklistPageHeading = 'Complete Pre-arrival tasks'

export default class ResidenceTasksController {
  constructor(
    private readonly placementService: PlacementService,
    private readonly formDataService: FormDataService,
  ) {}

  show(journey: JourneyType): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        params: { placementId, crn },
        user: { token },
      } = req
      const { errors, errorSummary } = fetchErrorsAndUserInput(req)

      const [placement] = await settlePromises<[Cas1SpaceBooking]>([
        this.placementService.getPlacement(token, placementId),
      ])

      const data = await this.formDataService.getFormData(token, placementId, journey)

      const taskList = new TasklistService(
        undefined,
        journey,
        data,
        `${managePaths.resident.show({ placementId, crn })}/tasks/${journey}`,
      )

      res.render('manage/resident/pre-arrival/taskList.njk', {
        backlink: managePaths.resident.show({ placementId, crn }),
        placement,
        data,
        pageHeading: tasklistPageHeading,
        taskList,
        errorSummary,
        errors,
      })
    }
  }

  submit(journey: JourneyType): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        params: { placementId, crn },
        user: { token },
      } = req

      try {
        const data = await this.formDataService.getFormData(token, placementId, journey)

        const taskList = new TasklistService(
          undefined,
          journey,
          data,
          `${managePaths.resident.show({ placementId, crn })}/tasks/${journey}`,
        )
        if (taskList.status !== 'complete') throw new ValidationError({ tasklist: 'The tasks are not complete.' })

        const status: TasklistStatus = 'submitted'

        await this.formDataService.updateFormData(token, placementId, journey, { ...data, status })

        // Copy tasklist data to profile blob
        const profileData = await this.formDataService.getFormData(token, placementId, 'profile')
        await this.formDataService.updateFormData(token, placementId, 'profile', {
          ...profileData,
          ...data,
          preArrivalTasksComplete: true,
        })

        res.redirect(managePaths.resident.show({ placementId, crn }))
      } catch (error) {
        catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          managePaths.resident.taskList({ journey, placementId, crn }),
        )
      }
    }
  }
}

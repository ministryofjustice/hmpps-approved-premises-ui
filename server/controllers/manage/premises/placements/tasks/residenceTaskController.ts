import type { Request, RequestHandler, Response } from 'express'
import { Cas1SpaceBooking } from '@approved-premises/api'
import { JourneyType, TasklistStatus } from '@approved-premises/ui'
import { FormDataService, PlacementService } from '../../../../../services'
import { settlePromises } from '../../../../../utils/utils'
import TasklistService from '../../../../../services/tasklistService'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../../../utils/validation'
import managePaths from '../../../../../paths/manage'

import PreArrival from '../../../../../form-pages/residence/pre-arrival'
import { ValidationError } from '../../../../../utils/errors'

export const tasklistPageHeading = 'Complete Pre-arrival tasks'

export default class ResidenceTasksController {
  constructor(
    private readonly placementService: PlacementService,
    private readonly formService: FormDataService,
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

      let data
      try {
        const id = `${placementId}-${journey}`
        data = await this.formService.getFormData(token, id)
      } catch (e) {
        data = {}
      }

      const { sections } = PreArrival

      const taskList = new TasklistService(
        undefined,
        sections,
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
        const formId = `${placementId}-${journey}`
        const data = await this.formService.getFormData(token, formId)

        const { sections } = PreArrival

        const taskList = new TasklistService(
          undefined,
          sections,
          data,
          `${managePaths.resident.show({ placementId, crn })}/tasks/${journey}`,
        )
        if (taskList.status !== 'complete') throw new ValidationError({ tasklist: 'The tasks are not complete.' })

        const status: TasklistStatus = 'submitted'
        await this.formService.updateFormData(token, formId, { ...data, status })
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

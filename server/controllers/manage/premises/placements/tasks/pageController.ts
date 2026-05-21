import type { NextFunction, Request, RequestHandler, Response } from 'express'
import createError from 'http-errors'

import type { JourneyType, TaskData, TaskNames } from '@approved-premises/ui'
import { FormDataService, PlacementService } from '../../../../../services'

import {
  catchAPIErrorOrPropogate,
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
} from '../../../../../utils/validation'
import paths from '../../../../../paths/manage'
import { UnknownPageError, ValidationError } from '../../../../../utils/errors'
import { viewPath } from '../../../../../form-pages/utils'
import { getPage } from '../../../../../form-pages/utils/getPage'

export default class PageController {
  constructor(
    private readonly placementService: PlacementService,
    private readonly formService: FormDataService,
  ) {}

  show(taskName: TaskNames, pageName: string, journey: JourneyType): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {
          params: { crn, placementId },
          user: { token },
        } = req

        const Page = getPage(taskName as TaskNames, pageName, journey)
        const placement = await this.placementService.getPlacement(token, placementId)

        let data: TaskData
        try {
          const id = `${placementId}-pre-arrival`
          data = await this.formService.getFormData(token, id)
        } catch (e) {
          data = {}
        }

        const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

        const body = (Object.keys(userInput).length ? userInput : data?.[taskName]?.[pageName] || {}) as TaskData

        const page = Page.initialize
          ? await Page.initialize(body, placement, token, undefined)
          : new Page(body, placement)

        const previous = page.previous()
        const backLink = previous
          ? paths.resident.tasks({ placementId, crn, journey, task: taskName, page: previous })
          : paths.resident.taskList({ placementId, crn, journey })

        res.render(`manage/resident/${viewPath(page, journey)}`, {
          backLink,
          formAction: `${paths.resident.tasks({ journey, placementId, task: taskName, page: page.name, crn })}?_method=PUT`,
          errors,
          errorSummary,
          task: taskName,
          page,
          ...page.body,
        })
      } catch (error) {
        if (error instanceof UnknownPageError) {
          next(createError(404, 'Not found'))
        } else {
          catchAPIErrorOrPropogate(req, res, error as Error)
        }
      }
    }
  }

  update(taskName: TaskNames, pageName: string, journey: JourneyType) {
    return async (req: Request, res: Response) => {
      const {
        params: { crn, placementId },
        user: { token },
      } = req
      try {
        const Page = getPage(taskName, pageName, 'pre-arrival')
        const placement = await this.placementService.getPlacement(token, placementId)

        let data
        const formId = `${placementId}-pre-arrival`
        try {
          data = await this.formService.getFormData(token, formId)
        } catch (e) {
          data = {}
        }

        const body = req.body || data[taskName]?.[pageName]

        const saveAndExit = req.body['save-and-exit'] !== undefined

        const page = Page.initialize
          ? await Page.initialize(body, placement, token, undefined)
          : new Page(body, placement)

        if (!saveAndExit) {
          const errors = page.errors()
          if (Object.keys(errors).length) {
            throw new ValidationError<typeof page>(errors)
          }
        }

        data[taskName] = data[taskName] || {}
        data[taskName][pageName] = page.body

        await this.formService.updateFormData(token, formId, data)

        const next = page.next()
        const redirect: string =
          next && !saveAndExit
            ? paths.resident.tasks({ journey, placementId, crn, task: taskName, page: page.next() })
            : paths.resident.taskList({ placementId, crn, journey })

        res.redirect(redirect)
      } catch (error) {
        catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.resident.tasks({ journey, placementId, crn, task: taskName, page: pageName }),
        )
      }
    }
  }
}

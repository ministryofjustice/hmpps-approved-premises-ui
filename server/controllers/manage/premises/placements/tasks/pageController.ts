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
import { getPageBackLink } from '../../../../../utils/backlinks'
import { DateFormats } from '../../../../../utils/dateUtils'

const taskNamesToJourney: Partial<Record<TaskNames, JourneyType>> = {
  'risk-information': 'pre-arrival',
}

export default class PageController {
  constructor(
    private readonly placementService: PlacementService,
    private readonly formDataService: FormDataService,
  ) {}

  private backLink({ req, placementId, crn }: { req: Request; placementId: string; crn: string }) {
    return getPageBackLink(
      `${paths.resident.show({ placementId, crn })}-task`,
      req,
      [paths.resident.tabRisk.placementRisks.pattern],
      paths.resident.show({ placementId, crn }),
    )
  }

  show(taskName: TaskNames, pageName: string, journey: JourneyType): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {
          params: { crn, placementId },
          user: { token },
        } = req

        const taskJourney: JourneyType = taskNamesToJourney[taskName] || journey

        const Page = getPage(taskName as TaskNames, pageName, taskJourney)
        const placement = await this.placementService.getPlacement(token, placementId)

        const data = await this.formDataService.getFormData(token, placementId, journey)

        const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

        const body = (Object.keys(userInput).length ? userInput : data?.[taskName]?.[pageName] || {}) as TaskData

        const page = Page.initialize
          ? await Page.initialize(body, placement, token, undefined)
          : new Page(body, placement)

        const hubPage =
          journey === taskJourney
            ? paths.resident.taskList({ placementId, crn, journey })
            : this.backLink({ req, placementId, crn })

        const previous = page.previous()
        const backLink = previous
          ? paths.resident.tasks({ placementId, crn, journey, task: taskName, page: previous })
          : hubPage

        res.render(`manage/resident/${viewPath(page, taskJourney)}`, {
          backLink,
          formAction: `${paths.resident.tasks({ journey, placementId, task: taskName, page: page.name, crn })}?_method=PUT`,
          errors,
          errorSummary,
          task: taskName,
          page,
          ...page.body,
          journey,
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

        const taskJourney: JourneyType = taskNamesToJourney[taskName] || journey

        const data = await this.formDataService.getFormData(token, placementId, journey)

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
        // Only save if data have been changed
        if (JSON.stringify(page.body) !== JSON.stringify(data[taskName]?.[pageName] || {})) {
          data[taskName] = data[taskName] || {}
          data[taskName][pageName] = page.body
          data[taskName].lastUpdated = DateFormats.dateObjToIsoDateTime(new Date())

          await this.formDataService.updateFormData(token, placementId, journey, data)
        }

        const next = page.next()

        const hubPage =
          journey === taskJourney
            ? paths.resident.taskList({ placementId, crn, journey })
            : this.backLink({ req, placementId, crn })

        const redirect: string =
          next && !saveAndExit
            ? paths.resident.tasks({ journey, placementId, crn, task: taskName, page: next })
            : hubPage

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

import type { NextFunction, Request, RequestHandler, Response } from 'express'
import createError from 'http-errors'

import { ApplicationService, PlacementApplicationService } from '../../services'

import {
  catchAPIErrorOrPropogate,
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
} from '../../utils/validation'
import paths from '../../paths/placementApplications'
import { UnknownPageError } from '../../utils/errors'
import { viewPath } from '../../form-pages/utils'
import { getPage } from '../../utils/applications/getPage'

export default class PagesController {
  constructor(
    private readonly placementApplicationService: PlacementApplicationService,
    private readonly applicationService: ApplicationService,
  ) {}

  show(taskName: string, pageName: string): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const Page = getPage(taskName, pageName, 'placement-applications')

        const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
        const page = await this.placementApplicationService.initializePage(
          Page,
          req,
          {
            applicationService: this.applicationService,
          },
          userInput,
        )

        res.render(viewPath(page, 'placement-applications'), {
          placementApplicationId: req.params.id,
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

  update(taskName: string, pageName: string) {
    return async (req: Request, res: Response) => {
      const Page = getPage(taskName, pageName, 'placement-applications')
      const page = await this.placementApplicationService.initializePage(Page, req, {
        applicationService: this.applicationService,
      })

      try {
        await this.placementApplicationService.save(page, req)

        res.redirect(paths.placementApplications.pages.show({ id: req.params.id, task: taskName, page: page.next() }))
      } catch (error) {
        catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.placementApplications.pages.show({ id: req.params.id, task: taskName, page: pageName }),
        )
      }
    }
  }
}

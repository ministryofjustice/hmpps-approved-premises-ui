import type { NextFunction, Request, RequestHandler, Response } from 'express'
import createError from 'http-errors'

import { getPage } from '../../utils/applications/utils'
import { PlacementApplicationService } from '../../services'

import {
  catchAPIErrorOrPropogate,
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
} from '../../utils/validation'
import paths from '../../paths/placementApplications'
import { UnknownPageError } from '../../utils/errors'
import { viewPath } from '../../form-pages/utils'

export default class PagesController {
  constructor(private readonly placementApplicationService: PlacementApplicationService) {}

  show(taskName: string, pageName: string): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const Page = getPage(taskName, pageName, 'placement-applications')

        const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
        const page = await this.placementApplicationService.initializePage(Page, req, {}, userInput)

        res.render(viewPath(page, 'placement-applications'), {
          placementRequestId: req.params.id,
          errors,
          errorSummary,
          task: taskName,
          page,
          ...page.body,
        })
      } catch (e) {
        if (e instanceof UnknownPageError) {
          next(createError(404, 'Not found'))
        } else {
          catchAPIErrorOrPropogate(req, res, e)
        }
      }
    }
  }

  update(taskName: string, pageName: string) {
    return async (req: Request, res: Response) => {
      const Page = getPage(taskName, pageName, 'placement-applications')
      const page = await this.placementApplicationService.initializePage(Page, req, {})

      try {
        await this.placementApplicationService.save(page, req)

        res.redirect(paths.placementApplications.pages.show({ id: req.params.id, task: taskName, page: page.next() }))
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.placementApplications.pages.show({ id: req.params.id, task: taskName, page: pageName }),
        )
      }
    }
  }
}

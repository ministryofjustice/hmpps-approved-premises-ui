import type { Request, Response, RequestHandler, NextFunction } from 'express'
import createError from 'http-errors'

import type { DataServices } from '@approved-premises/ui'
import { getPage } from '../../../utils/applicationUtils'
import { ApplicationService } from '../../../services'

import {
  catchValidationErrorOrPropogate,
  catchAPIErrorOrPropogate,
  fetchErrorsAndUserInput,
} from '../../../utils/validation'
import paths from '../../../paths/apply'
import { UnknownPageError } from '../../../utils/errors'
import { viewPath } from '../../../form-pages/utils'

export default class PagesController {
  constructor(private readonly applicationService: ApplicationService, private readonly dataServices: DataServices) {}

  show(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const Page = getPage(req.params.task, req.params.page)

        const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
        const page = await this.applicationService.initializePage(Page, req, this.dataServices, userInput)

        res.render(viewPath(page), {
          applicationId: req.params.id,
          errors,
          errorSummary,
          task: req.params.task,
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

  update() {
    return async (req: Request, res: Response) => {
      const Page = getPage(req.params.task, req.params.page)
      const page = await this.applicationService.initializePage(Page, req, this.dataServices)

      try {
        await this.applicationService.save(page, req)
        const next = page.next()
        if (next) {
          res.redirect(paths.applications.pages.show({ id: req.params.id, task: req.params.task, page: page.next() }))
        } else {
          res.redirect(paths.applications.show({ id: req.params.id }))
        }
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.applications.pages.show({ id: req.params.id, task: req.params.task, page: req.params.page }),
        )
      }
    }
  }
}

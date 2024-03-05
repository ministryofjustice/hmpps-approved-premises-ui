import type { NextFunction, Request, RequestHandler, Response } from 'express'
import createError from 'http-errors'

import type { DataServices } from '@approved-premises/ui'
import { ApplicationService } from '../../../services'

import {
  catchAPIErrorOrPropogate,
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
} from '../../../utils/validation'
import paths from '../../../paths/apply'
import { UnknownPageError } from '../../../utils/errors'
import { viewPath } from '../../../form-pages/utils'
import { getPage } from '../../../utils/applications/getPage'

export default class PagesController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly dataServices: DataServices,
  ) {}

  show(taskName: string, pageName: string): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const Page = getPage(taskName, pageName, 'applications')

        const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
        const page = await this.applicationService.initializePage(Page, req, this.dataServices, userInput)

        res.render(viewPath(page, 'applications'), {
          applicationId: req.params.id,
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
      const Page = getPage(taskName, pageName, 'applications')
      const page = await this.applicationService.initializePage(Page, req, this.dataServices)

      try {
        await this.applicationService.save(page, req)
        const next = page.next()
        if (next) {
          res.redirect(paths.applications.pages.show({ id: req.params.id, task: taskName, page: page.next() }))
        } else {
          res.redirect(paths.applications.show({ id: req.params.id }))
        }
      } catch (error) {
        catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.applications.pages.show({ id: req.params.id, task: taskName, page: pageName }),
        )
      }
    }
  }
}

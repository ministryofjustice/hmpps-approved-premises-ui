import type { Request, Response, RequestHandler, NextFunction } from 'express'
import createError from 'http-errors'

import { getPage } from '../../utils/assessmentUtils'
import { AssessmentService } from '../../services'

import {
  catchValidationErrorOrPropogate,
  catchAPIErrorOrPropogate,
  fetchErrorsAndUserInput,
} from '../../utils/validation'
import paths from '../../paths/assess'
import { UnknownPageError } from '../../utils/errors'
import { viewPath } from '../../form-pages/utils'
import TasklistPage, { TasklistPageInterface } from '../../form-pages/tasklistPage'

export default class PagesController {
  constructor(private readonly assessmentService: AssessmentService) {}

  show(taskName: string, pageName: string): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

        const Page: TasklistPageInterface = getPage(taskName, pageName)
        const page: TasklistPage = await this.assessmentService.initializePage(Page, req, userInput)

        res.render(viewPath(page, 'assessments'), {
          assessmentId: req.params.id,
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
      try {
        const Page: TasklistPageInterface = getPage(taskName, pageName)
        const page: TasklistPage = await this.assessmentService.initializePage(Page, req)
        await this.assessmentService.save(page, req)

        const next = page.next()

        if (next) {
          res.redirect(paths.assessments.pages.show({ id: req.params.id, task: taskName, page: page.next() }))
        } else {
          res.redirect(paths.assessments.show({ id: req.params.id }))
        }
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.assessments.pages.show({ id: req.params.id, task: taskName, page: pageName }),
        )
      }
    }
  }
}

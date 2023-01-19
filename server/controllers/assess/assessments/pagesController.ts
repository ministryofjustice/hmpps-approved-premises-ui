import type { Request, Response, RequestHandler, NextFunction } from 'express'
import createError from 'http-errors'

import { getPage } from '../../../utils/assessmentUtils'
import { AssessmentService } from '../../../services'

import {
  catchValidationErrorOrPropogate,
  catchAPIErrorOrPropogate,
  fetchErrorsAndUserInput,
} from '../../../utils/validation'
import paths from '../../../paths/assess'
import { UnknownPageError } from '../../../utils/errors'
import { viewPath } from '../../../form-pages/utils'
import TasklistPage, { TasklistPageInterface } from '../../../form-pages/tasklistPage'
import { DataServices } from '../../../@types/ui'

export default class PagesController {
  constructor(private readonly assessmentService: AssessmentService, private readonly dataServices: DataServices) {}

  show(taskName: string, pageName: string): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

        const Page: TasklistPageInterface = getPage(taskName, pageName)
        const page: TasklistPage = await this.assessmentService.initializePage(Page, req, this.dataServices, userInput)

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
        const page: TasklistPage = await this.assessmentService.initializePage(Page, req, this.dataServices)
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

  updateSufficientInformation(taskName: string, pageName: string) {
    return async (req: Request, res: Response) => {
      if (req.body.sufficientInformation === 'no' && req.body.query) {
        const clarificationNote = {
          query: req.body.query,
        }
        await this.assessmentService.createClarificationNote(req.user.token, req.params.id, clarificationNote)

        res.redirect(paths.assessments.clarificationNotes.confirm({ id: req.params.id }))
      } else {
        const requestHandler = this.update(taskName, pageName)
        await requestHandler(req, res)
      }
    }
  }
}

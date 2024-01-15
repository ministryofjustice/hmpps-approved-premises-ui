import type { NextFunction, Request, RequestHandler, Response } from 'express'
import createError from 'http-errors'

import { ApprovedPremisesAssessment as Assessment, UpdatedClarificationNote } from '@approved-premises/api'
import { getPage } from '../../../utils/assessments/utils'
import { AssessmentService } from '../../../services'

import {
  catchAPIErrorOrPropogate,
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
} from '../../../utils/validation'
import paths from '../../../paths/assess'
import { UnknownPageError } from '../../../utils/errors'
import { viewPath } from '../../../form-pages/utils'
import TasklistPage, { TasklistPageInterface } from '../../../form-pages/tasklistPage'
import { DataServices } from '../../../@types/ui'

export default class PagesController {
  constructor(
    private readonly assessmentService: AssessmentService,
    private readonly dataServices: DataServices,
  ) {}

  show(taskName: string, pageName: string): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
        const assessment = await this.assessmentService.findAssessment(req.user.token, req.params.id)

        const Page: TasklistPageInterface = getPage(taskName, pageName)
        const page: TasklistPage = await this.assessmentService.initializePage(
          Page,
          assessment,
          req,
          this.dataServices,
          userInput,
        )

        res.render(viewPath(page, 'assessments'), {
          assessmentId: req.params.id,
          assessment,
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
      const assessment = await this.assessmentService.findAssessment(req.user.token, req.params.id)
      const page = await this.saveAndValidate(assessment, taskName, pageName, req, res)
      if (page) {
        const next = page.next()

        if (next) {
          res.redirect(paths.assessments.pages.show({ id: req.params.id, task: taskName, page: next }))
        } else {
          res.redirect(paths.assessments.show({ id: req.params.id }))
        }
      }
    }
  }

  updateInformationRecieved(taskName: string, pageName: string) {
    return async (req: Request, res: Response) => {
      if (req.body.informationReceived === 'yes') {
        const assessment = await this.assessmentService.findAssessment(req.user.token, req.params.id)
        const clarificationNote = assessment.clarificationNotes.find(note => !note.response)

        const page = await this.saveAndValidate(assessment, taskName, pageName, req, res)

        if (page) {
          await this.assessmentService.updateClarificationNote(
            req.user.token,
            req.params.id,
            clarificationNote.id,
            page.body as UpdatedClarificationNote,
          )
          res.redirect(paths.assessments.show({ id: req.params.id }))
        }
      } else {
        const requestHandler = this.update(taskName, pageName)
        await requestHandler(req, res)
      }
    }
  }

  private async saveAndValidate(
    assessment: Assessment,
    taskName: string,
    pageName: string,
    req: Request,
    res: Response,
  ) {
    try {
      const Page: TasklistPageInterface = getPage(taskName, pageName)
      const page: TasklistPage = await this.assessmentService.initializePage(Page, assessment, req, this.dataServices)
      await this.assessmentService.save(page, req)

      return page
    } catch (err) {
      return catchValidationErrorOrPropogate(
        req,
        res,
        err,
        paths.assessments.pages.show({ id: req.params.id, task: taskName, page: pageName }),
      )
    }
  }
}

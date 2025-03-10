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
import { DataServices, TaskNames } from '../../../@types/ui'
import { remapArsonAssessmentData } from '../../../form-pages/utils/matchingInformationUtils'

export default class PagesController {
  constructor(
    private readonly assessmentService: AssessmentService,
    private readonly dataServices: DataServices,
  ) {}

  show(taskName: TaskNames, pageName: string): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
        const rawAssessment = await this.assessmentService.findAssessment(req.user.token, req.params.id)

        // TODO: remove once arson remapping (APS-1876) is completed
        const assessment: Assessment = {
          ...rawAssessment,
          data: remapArsonAssessmentData(rawAssessment.data),
        }

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
      } catch (error) {
        if (error instanceof UnknownPageError) {
          next(createError(404, 'Not found'))
        } else {
          catchAPIErrorOrPropogate(req, res, error as Error)
        }
      }
    }
  }

  update(taskName: TaskNames, pageName: string) {
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

  updateInformationRecieved(taskName: TaskNames, pageName: string) {
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
    taskName: TaskNames,
    pageName: string,
    req: Request,
    res: Response,
  ) {
    try {
      const Page: TasklistPageInterface = getPage(taskName, pageName)
      const page: TasklistPage = await this.assessmentService.initializePage(Page, assessment, req, this.dataServices)
      await this.assessmentService.save(page, req)

      return page
    } catch (error) {
      return catchValidationErrorOrPropogate(
        req,
        res,
        error as Error,
        paths.assessments.pages.show({ id: req.params.id, task: taskName, page: pageName }),
      )
    }
  }
}

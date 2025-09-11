import type { NextFunction, Request, RequestHandler, Response } from 'express'
import createError from 'http-errors'

import { TaskNames } from '@approved-premises/ui'
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
import { LegacyError } from '../../services/placementApplicationService'

export default class PagesController {
  constructor(
    private readonly placementApplicationService: PlacementApplicationService,
    private readonly applicationService: ApplicationService,
  ) {}

  show(taskName: TaskNames, pageName: string): RequestHandler {
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
          backLink: paths.placementApplications.pages.show({
            id: req.params.id,
            task: taskName,
            page: page.previous(),
          }),
          formAction: `${paths.placementApplications.pages.update({ id: req.params.id, task: taskName, page: page.name })}?_method=PUT`,
          placementApplicationId: req.params.id,
          errors,
          errorSummary,
          task: taskName,
          page,
          ...page.body,
        })
      } catch (error) {
        if (error instanceof LegacyError) {
          res.redirect(
            paths.placementApplications.pages.show({
              id: req.params.id,
              task: taskName,
              page: 'sentence-type-check',
            }),
          )
          return
        }
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
      const Page = getPage(taskName, pageName, 'placement-applications')
      try {
        const page = await this.placementApplicationService.initializePage(Page, req, {
          applicationService: this.applicationService,
        })
        await this.placementApplicationService.save(page, req)
        res.redirect(paths.placementApplications.pages.show({ id: req.params.id, task: taskName, page: page.next() }))
      } catch (error) {
        if (error instanceof LegacyError) {
          res.redirect(
            paths.placementApplications.pages.show({
              id: req.params.id,
              task: taskName,
              page: 'sentence-type-check',
            }),
          )
          return
        }
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

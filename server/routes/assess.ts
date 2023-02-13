/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../controllers'
import Assess from '../form-pages/assess'
import paths from '../paths/assess'

import actions from './utils'
import { getPage } from '../utils/assessments/utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { pages } = Assess
  const { get, put, post } = actions(router)
  const {
    assessmentsController,
    assessmentPagesController,
    clarificationNotesController,
    allocationsController,
    supportingInformationController,
  } = controllers

  get(paths.assessments.index.pattern, assessmentsController.index())
  get(paths.assessments.show.pattern, assessmentsController.show())

  get(paths.assessments.clarificationNotes.confirm.pattern, clarificationNotesController.confirm())

  get(paths.assessments.supportingInformationPath.pattern, supportingInformationController.show())

  post(paths.assessments.submission.pattern, assessmentsController.submit())

  get(paths.allocations.show.pattern, allocationsController.show())

  Object.keys(pages).forEach((taskKey: string) => {
    Object.keys(pages[taskKey]).forEach((pageKey: string) => {
      const { pattern } = paths.assessments.show.path(`tasks/${taskKey}/pages/${pageKey}`)

      const page = getPage(taskKey, pageKey)
      const updateAction = Reflect.getMetadata('page:controllerActions:update', page)

      get(pattern, assessmentPagesController.show(taskKey, pageKey))

      if (updateAction) {
        if (assessmentPagesController[updateAction]) {
          put(pattern, assessmentPagesController[updateAction](taskKey, pageKey))
        } else {
          throw new Error(`No controller action found for AssessmentPagesController#${updateAction}`)
        }
      } else {
        put(pattern, assessmentPagesController.update(taskKey, pageKey))
      }
    })
  })

  return router
}

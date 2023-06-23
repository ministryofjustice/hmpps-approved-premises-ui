/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../controllers'
import type { Services } from '../services'

import paths from '../paths/placementApplications'
import Match from '../form-pages/placement-application'

import actions from './utils'

export default function routes(controllers: Controllers, router: Router, services: Partial<Services>): Router {
  const { get, put, post } = actions(router, services.auditService)
  const { pages } = Match

  const { placementApplicationPagesController, placementRequestController, placementApplicationReviewController } =
    controllers

  post(paths.placementApplications.create.pattern, placementRequestController.create())
  post(paths.placementApplications.submit.pattern, placementRequestController.submit())

  Object.keys(pages).forEach((taskKey: string) => {
    Object.keys(pages[taskKey]).forEach((pageKey: string) => {
      const { pattern } = paths.placementApplications.show.path(`tasks/${taskKey}/pages/${pageKey}`)
      get(pattern, placementApplicationPagesController.show(taskKey, pageKey))
      put(pattern, placementApplicationPagesController.update(taskKey, pageKey))
    })
  })

  get(paths.placementApplications.review.show.pattern, placementApplicationReviewController.show('review'))
  post(paths.placementApplications.review.update.pattern, placementApplicationReviewController.update())
  get(paths.placementApplications.review.decision.pattern, placementApplicationReviewController.show('decision'))
  post(paths.placementApplications.review.submission.pattern, placementApplicationReviewController.submit())
  get(paths.placementApplications.review.confirm.pattern, placementApplicationReviewController.confirm())

  return router
}

/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../controllers'
import paths from '../paths/placementApplications'
import Match from '../form-pages/placement-application'

import actions from './utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get, put, post } = actions(router)
  const { pages } = Match

  const { placementApplicationPagesController, placementRequestController } = controllers

  post(paths.placementApplications.create.pattern, placementRequestController.create())
  post(paths.placementApplications.submit.pattern, placementRequestController.submit())

  Object.keys(pages).forEach((taskKey: string) => {
    Object.keys(pages[taskKey]).forEach((pageKey: string) => {
      const { pattern } = paths.placementApplications.show.path(`tasks/${taskKey}/pages/${pageKey}`)
      get(pattern, placementApplicationPagesController.show(taskKey, pageKey))
      put(pattern, placementApplicationPagesController.update(taskKey, pageKey))
    })
  })

  return router
}

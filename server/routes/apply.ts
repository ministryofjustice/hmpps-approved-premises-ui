/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../controllers'
import paths from '../paths/apply'

import actions from './utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get, post, put } = actions(router)
  const { applicationsController, pagesController, peopleController, offencesController } = controllers

  get(paths.applications.start.pattern, applicationsController.start())
  get(paths.applications.index.pattern, applicationsController.index())
  get(paths.applications.new.pattern, applicationsController.new())
  get(paths.applications.show.pattern, applicationsController.show())
  post(paths.applications.create.pattern, applicationsController.create())
  post(paths.applications.submission.pattern, applicationsController.submit())

  post(paths.applications.people.find.pattern, peopleController.find())
  get(paths.applications.people.selectOffence.pattern, offencesController.selectOffence())

  get(paths.applications.pages.show.pattern, pagesController.show())
  put(paths.applications.pages.update.pattern, pagesController.update())

  return router
}

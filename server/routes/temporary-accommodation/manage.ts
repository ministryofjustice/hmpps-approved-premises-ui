/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../../controllers'
import paths from '../../paths/temporary-accommodation/manage'

import actions from '../utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get, post } = actions(router)

  const { premisesController } = controllers.temporaryAccommodation

  get(paths.premises.index.pattern, premisesController.index())
  get(paths.premises.new.pattern, premisesController.new())
  post(paths.premises.create.pattern, premisesController.create())
  get(paths.premises.show.pattern, premisesController.show())

  return router
}

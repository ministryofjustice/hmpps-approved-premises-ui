/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../controllers'
import type { Services } from '../services'

import managePaths from '../paths/manage'
import peoplePaths from '../paths/people'

import actions from './utils'

export default function routes(controllers: Controllers, router: Router, services: Partial<Services>): Router {
  const { get, post } = actions(router, services.auditService)

  const { peopleController, timelineController } = controllers

  post(managePaths.people.find.pattern, peopleController.find(), {
    auditEvent: 'FIND_PERSON',
    auditBodyParams: ['crn'],
  })

  get(peoplePaths.timeline.find.pattern, timelineController.find(), { auditEvent: 'SHOW_PERSON' })

  return router
}

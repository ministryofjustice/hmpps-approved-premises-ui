/* istanbul ignore file */

import type { Router } from 'express'
import type { Services } from '../services'
import Apply from '../form-pages/apply'

import type { Controllers } from '../controllers'
import paths from '../paths/apply'

import actions from './utils'

export default function routes(controllers: Controllers, router: Router, services: Partial<Services>): Router {
  const { pages } = Apply
  const { get, post, put } = actions(router, services.auditService)
  const { applicationsController, pagesController, peopleController, offencesController, documentsController } =
    controllers

  get(paths.applications.start.pattern, applicationsController.start(), { auditEvent: 'START_APPLICATION' })
  get(paths.applications.index.pattern, applicationsController.index(), { auditEvent: 'LIST_APPLICATIONS' })
  get(paths.applications.new.pattern, applicationsController.new(), { auditEvent: 'NEW_APPLICATION' })
  get(paths.applications.show.pattern, applicationsController.show(), { auditEvent: 'VIEW_APPLICATION' })
  post(paths.applications.create.pattern, applicationsController.create(), {
    auditEvent: 'CREATE_APPLICATION',
  })
  post(paths.applications.submission.pattern, applicationsController.submit(), { auditEvent: 'SUBMIT_APPLICATION' })

  post(paths.applications.people.find.pattern, peopleController.find(), {
    auditEvent: 'APPLY_FIND_PERSON',
    auditBodyParams: ['crn'],
  })
  get(paths.applications.people.selectOffence.pattern, offencesController.selectOffence(), {
    auditEvent: 'SELECT_OFFENCE',
  })
  get(paths.applications.people.documents.pattern, documentsController.show(), { auditEvent: 'SHOW_DOCUMENTS' })
  get(paths.applications.withdraw.confirm.pattern, applicationsController.confirmWithdrawal(), {
    auditEvent: 'VIEW_CONFIRM_WITHDRAWAL_SCREEN',
  })
  post(paths.applications.withdraw.create.pattern, applicationsController.withdraw(), {
    auditEvent: 'WITHDRAW_APPLICATION',
  })

  Object.keys(pages).forEach((taskKey: string) => {
    Object.keys(pages[taskKey]).forEach((pageKey: string) => {
      const { pattern } = paths.applications.show.path(`tasks/${taskKey}/pages/${pageKey}`)
      get(pattern, pagesController.show(taskKey, pageKey), {
        auditEvent: 'VIEW_APPLICATION',
        additionalMetadata: { task: taskKey, page: pageKey },
      })
      put(pattern, pagesController.update(taskKey, pageKey), {
        auditEvent: `UPDATE_APPLICATION_SUCCESS`,
        additionalMetadata: { task: taskKey, page: pageKey },
        redirectAuditEventSpecs: [
          {
            // If we redirect to the same page, the user has hit an error
            path: pattern,
            auditEvent: 'UPDATE_APPLICATION_FAILURE',
          },
        ],
      })
    })
  })

  return router
}

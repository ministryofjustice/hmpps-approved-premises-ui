/* istanbul ignore file */

import type { Router } from 'express'
import { TaskNames } from '@approved-premises/ui'
import type { Services } from '../services'
import Apply from '../form-pages/apply'

import type { Controllers } from '../controllers'
import paths from '../paths/apply'

import actions from './utils'
import { idValidator } from './validators'

export default function routes(controllers: Controllers, router: Router, services: Partial<Services>): Router {
  const { pages } = Apply
  const { get, post, put } = actions(router, services.auditService)
  const {
    applicationsController,
    appealsController,
    pagesController,
    peopleController,
    offencesController,
    documentsController,
    withdrawalsController,
    notesController,
    withdrawablesController,
    expiryController,
  } = controllers

  get(paths.applications.start.pattern, applicationsController.start(), { auditEvent: 'START_APPLICATION' })
  get(paths.applications.index.pattern, applicationsController.index(), { auditEvent: 'LIST_APPLICATIONS' })
  get(paths.applications.dashboard.pattern, applicationsController.dashboard(), {
    auditEvent: 'LIST_APPLICATIONS_DASHBOARD',
  })
  get(paths.applications.new.pattern, applicationsController.new(), { auditEvent: 'NEW_APPLICATION' })
  get(paths.applications.show.pattern, applicationsController.show(), {
    auditEvent: 'VIEW_APPLICATION',
    ...idValidator,
  })
  post(paths.applications.create.pattern, applicationsController.create(), {
    auditEvent: 'CREATE_APPLICATION',
  })
  post(paths.applications.submission.pattern, applicationsController.submit(), {
    auditEvent: 'SUBMIT_APPLICATION',
    ...idValidator,
  })

  post(paths.applications.people.find.pattern, peopleController.find(), {
    auditEvent: 'APPLY_FIND_PERSON',
    auditBodyParams: ['crn'],
  })

  get(paths.applications.people.manageApplications.pattern, applicationsController.manageApplications(), {
    auditEvent: 'MANAGE_APPLICATIONS',
  })
  get(paths.applications.people.selectOffence.pattern, offencesController.selectOffence(), {
    auditEvent: 'SELECT_OFFENCE',
  })

  // Withdrawals
  get(paths.applications.people.documents.pattern, documentsController.show(), { auditEvent: 'SHOW_DOCUMENTS' })
  post(paths.applications.withdraw.new.pattern, withdrawalsController.new(), {
    auditEvent: 'SELECT_WITHDRAWABLE_TYPE',
    ...idValidator,
  })
  get(paths.applications.withdrawables.show.pattern, withdrawablesController.show(), {
    auditEvent: 'SELECT_WITHDRAWABLE',
    ...idValidator,
  })
  post(paths.applications.withdrawables.show.pattern, withdrawablesController.show(), {
    auditEvent: 'SELECT_WITHDRAWABLE',
    ...idValidator,
  })
  post(paths.applications.withdrawables.create.pattern, withdrawablesController.create(), {
    auditEvent: 'VIEW_WITHDRAWABLE',
    ...idValidator,
  })
  get(paths.applications.withdraw.new.pattern, withdrawalsController.new(), {
    auditEvent: 'NEW_WITHDRAWL',
    ...idValidator,
  })
  post(paths.applications.withdraw.create.pattern, withdrawalsController.create(), {
    auditEvent: 'WITHDRAW_APPLICATION',
    ...idValidator,
  })

  // Expiry
  get(paths.applications.expire.pattern, expiryController.new(), {
    auditEvent: 'NEW_APPLICATION_EXPIRY',
    ...idValidator,
  })
  post(paths.applications.expire.pattern, expiryController.create(), {
    auditEvent: 'EXPIRE_APPLICATION',
    ...idValidator,
  })

  // Notes
  post(paths.applications.notes.new.pattern, notesController.new(), {
    auditEvent: 'CONFIRM_NEW_NOTE',
    ...idValidator,
  })
  post(paths.applications.notes.create.pattern, notesController.create(), {
    auditEvent: 'CREATE_NEW_NOTE',
    ...idValidator,
  })

  // Appeals
  get(paths.applications.appeals.new.pattern, appealsController.new(), {
    auditEvent: 'NEW_APPEAL',
    ...idValidator,
  })
  get(paths.applications.appeals.show.pattern, appealsController.show(), {
    auditEvent: 'VIEW_APPEAL',
    ...idValidator,
  })
  post(paths.applications.appeals.create.pattern, appealsController.create(), {
    auditEvent: 'CREATE_APPEAL',
    ...idValidator,
  })

  Object.keys(pages).forEach((taskKey: TaskNames) => {
    Object.keys(pages[taskKey]).forEach((pageKey: string) => {
      const { pattern } = paths.applications.show.path(`tasks/${taskKey}/pages/${pageKey}`)
      get(pattern, pagesController.show(taskKey, pageKey), {
        auditEvent: 'VIEW_APPLICATION',
        additionalMetadata: { task: taskKey, page: pageKey },
        ...idValidator,
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
        ...idValidator,
      })
    })
  })

  return router
}

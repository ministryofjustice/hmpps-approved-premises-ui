/* istanbul ignore file */

import type { Router } from 'express'

import { TaskNames } from '@approved-premises/ui'
import type { Controllers } from '../controllers'
import type { Services } from '../services'

import paths from '../paths/placementApplications'
import Match from '../form-pages/placement-application'

import actions from './utils'

export default function routes(controllers: Controllers, router: Router, services: Partial<Services>): Router {
  const { get, put, post } = actions(router, services.auditService)
  const { pages } = Match

  const {
    placementApplicationPagesController,
    placementRequestController,
    placementApplicationReviewController,
    placementApplicationWithdrawalsController,
  } = controllers

  get(paths.placementApplications.create.pattern, placementRequestController.create(), {
    auditEvent: 'CREATE_PLACEMENT_APPLICATION',
  })
  post(paths.placementApplications.create.pattern, placementRequestController.create(), {
    auditEvent: 'CREATE_PLACEMENT_APPLICATION',
  })

  post(paths.placementApplications.submit.pattern, placementRequestController.submit(), {
    auditEvent: 'SUBMIT_PLACEMENT_APPLICATION',
  })

  Object.keys(pages).forEach((taskKey: TaskNames) => {
    Object.keys(pages[taskKey]).forEach((pageKey: string) => {
      const { pattern } = paths.placementApplications.show.path(`tasks/${taskKey}/pages/${pageKey}`)
      get(pattern, placementApplicationPagesController.show(taskKey, pageKey), {
        auditEvent: 'VIEW_PLACEMENT_APPLICATION',
        additionalMetadata: { task: taskKey, page: pageKey },
      })
      put(pattern, placementApplicationPagesController.update(taskKey, pageKey), {
        auditEvent: 'UPDATE_PLACEMENT_APPLICATION_SUCCESS',
        additionalMetadata: { task: taskKey, page: pageKey },
        redirectAuditEventSpecs: [
          {
            // If we redirect to the same page, the user has hit an error
            path: pattern,
            auditEvent: 'UPDATE_PLACEMENT_APPLICATION_FAILURE',
          },
        ],
      })
    })
  })

  get(paths.placementApplications.review.show.pattern, placementApplicationReviewController.show('review'), {
    auditEvent: 'VIEW_PLACEMENT_APPLICATION',
    additionalMetadata: { page: 'review' },
  })
  post(paths.placementApplications.review.update.pattern, placementApplicationReviewController.update(), {
    auditEvent: 'REVIEW_PLACEMENT_APPLICATION_UPDATE_SUCCESS',
    additionalMetadata: { page: 'review' },
    redirectAuditEventSpecs: [
      {
        path: paths.placementApplications.review.show.pattern,
        auditEvent: 'REVIEW_PLACEMENT_APPLICATION_UPDATE_FAILURE',
      },
    ],
  })
  get(paths.placementApplications.review.decision.pattern, placementApplicationReviewController.show('decision'), {
    auditEvent: 'VIEW_PLACEMENT_APPLICATION',
    additionalMetadata: { page: 'decision' },
  })
  post(paths.placementApplications.review.submission.pattern, placementApplicationReviewController.submit(), {
    auditEvent: 'SUBMIT_PLACEMENT_APPLICATION_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.placementApplications.review.decision.pattern,
        auditEvent: 'SUBMIT_PLACEMENT_APPLICATION_FAILURE',
      },
    ],
  })
  get(paths.placementApplications.review.confirm.pattern, placementApplicationReviewController.confirm())
  get(paths.placementApplications.withdraw.new.pattern, placementApplicationWithdrawalsController.new())
  post(paths.placementApplications.withdraw.create.pattern, placementApplicationWithdrawalsController.create())

  return router
}

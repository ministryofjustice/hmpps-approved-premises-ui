/* istanbul ignore file */

import { type RequestHandler, Router } from 'express'
import { ApprovedPremisesUserPermission } from '@approved-premises/api'
import { auditMiddleware } from '../middleware/auditMiddleware'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { FormPages, JourneyType, MiddlewareSpec, TaskNames } from '../@types/ui'
import applicationAuthMiddleware from '../middleware/applicationAuthMiddleware'
import { validateMiddleware } from '../middleware/validateMiddleware'
import { fieldValidators } from './validators'
import paths from '../paths/manage'
import PagesController from '../controllers/placementApplications/pagesController'
import PageController from '../controllers/manage/premises/placements/tasks/pageController'

export default function actions(router: Router) {
  return {
    get: (path: string | Array<string>, handler: RequestHandler, middlewareSpec?: MiddlewareSpec) =>
      router.get(
        path,
        asyncMiddleware(
          applicationAuthMiddleware(
            validateMiddleware(auditMiddleware(handler, middlewareSpec), fieldValidators),
            middlewareSpec,
          ),
        ),
      ),
    post: (path: string | Array<string>, handler: RequestHandler, middlewareSpec?: MiddlewareSpec) =>
      router.post(
        path,
        asyncMiddleware(
          applicationAuthMiddleware(
            validateMiddleware(auditMiddleware(handler, middlewareSpec), fieldValidators),
            middlewareSpec,
          ),
        ),
      ),
    put: (path: string | Array<string>, handler: RequestHandler, middlewareSpec?: MiddlewareSpec) =>
      router.put(
        path,
        asyncMiddleware(
          applicationAuthMiddleware(
            validateMiddleware(auditMiddleware(handler, middlewareSpec), fieldValidators),
            middlewareSpec,
          ),
        ),
      ),
    delete: (path: string | Array<string>, handler: RequestHandler, middlewareSpec?: MiddlewareSpec) =>
      router.delete(
        path,
        asyncMiddleware(
          applicationAuthMiddleware(
            validateMiddleware(auditMiddleware(handler, middlewareSpec), fieldValidators),
            middlewareSpec,
          ),
        ),
      ),
  }
}

/**
 * Builds a set of routes based on a tasklist of formPages.
 * @param router - the router to add these routes to
 * @param pages - a set of FormPages in a sections -> tasks -> pages structure
 * @param journey - the name of the journey/tasklist to be created which is added to the paths.
 * @param pageController - the controller to handle these routes
 */
export const buildTasklistRoutes = (
  router: Router,
  pages: FormPages,
  journey: JourneyType,
  pageController: PageController,
  allowedPermissions: Array<ApprovedPremisesUserPermission>,
) => {
  const { get, put } = actions(router)

  Object.keys(pages).forEach((taskKey: TaskNames) => {
    Object.keys(pages[taskKey]).forEach((pageKey: string) => {
      const { pattern } = paths.resident.show.path(`tasks/${journey}/${taskKey}/page/${pageKey}`)
      const page = pages[taskKey][pageKey]
      const updateAction: keyof PagesController = Reflect.getMetadata('page:controllerActions:update', page)

      get(pattern, pageController.show(taskKey, pageKey, journey), {
        auditEvent: 'VIEW_RESIDENCE_TASK',
        additionalMetadata: { journey, task: taskKey, page: pageKey },
        allowedPermissions,
      })

      let controllerAction

      if (updateAction) {
        if (pageController[updateAction]) {
          controllerAction = pageController[updateAction](taskKey, pageKey, journey)
        } else {
          throw new Error(`No controller action found for residence task ${updateAction}`)
        }
      } else {
        controllerAction = pageController.update(taskKey, pageKey, journey)
      }

      put(pattern, controllerAction, {
        auditEvent: `UPDATE_RESIDENCE_TASK`,
        additionalMetadata: { journey, task: taskKey, page: pageKey },
        redirectAuditEventSpecs: [
          {
            // If we redirect to the same page, the user has hit an error
            path: pattern,
            auditEvent: 'UPDATE_RESIDENCE_TASK_FAILURE',
          },
        ],
        allowedPermissions,
      })
    })
  })
}

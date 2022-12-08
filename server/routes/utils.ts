/* istanbul ignore file */

import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'

export default function actions(router: Router) {
  return {
    get: (path: string | Array<string>, handler: RequestHandler) => router.get(path, asyncMiddleware(handler)),
    post: (path: string | Array<string>, handler: RequestHandler) => router.post(path, asyncMiddleware(handler)),
    put: (path: string | Array<string>, handler: RequestHandler) => router.put(path, asyncMiddleware(handler)),
  }
}

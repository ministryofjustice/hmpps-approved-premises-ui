import express, { Router } from 'express'
import { jwtDecode } from 'jwt-decode'
import { documentRender } from '../services/documentRender'
import logger from '../../logger'

const requiredRole = 'ROLE_PROBATION'

export default function setUpDocumentRender(): Router {
  const router = express.Router()

  router.post('/render-application', (req, res) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer <token>
    if (token) {
      try {
        const { authorities: roles = [] } = jwtDecode(token) as { authorities?: Array<string> }
        if (roles.includes(requiredRole)) return res.json(documentRender(req.body))
        const error: string = `User lacks required role ${requiredRole} (${roles.join(', ')})`
        logger.error(error)
        return res.status(403).json({ success: false, error })
      } catch {
        /* allow to fall through */
      }
    }

    logger.error('User is not authorised to access this')
    return res.status(401).json({
      success: false,
      error: 'Authentication token missing or invalid',
    })
  })

  return router
}

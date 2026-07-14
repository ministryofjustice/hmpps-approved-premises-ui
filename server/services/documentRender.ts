import { jwtDecode } from 'jwt-decode'
import { Request, Response } from 'express'
import { getResponses } from '../utils/applications/getResponses'
import logger from '../../logger'

export const caseDetailRole = 'ROLE_PROBATION_API__APPROVED_PREMISES__CASE_DETAIL'

export const documentRender = (req: Request, res: Response): unknown => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1] // Bearer <token>
  if (token) {
    try {
      const { authorities: roles = [] } = jwtDecode(token) as { authorities?: Array<string> }
      if (roles.includes(caseDetailRole)) {
        return res.json(getResponses(req.body))
      }
      const error: string = `User lacks required role ${caseDetailRole} (${roles.join(', ')})`
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
}

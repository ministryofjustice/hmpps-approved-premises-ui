import type { Request, Response, RequestHandler } from 'express'
import { getQualificationsForApplication } from '../../../utils/applications/getQualificationsForApplication'

import { ApplicationService, UserService } from '../../../services'

export default class AllocationsController {
  constructor(private readonly applicationService: ApplicationService, private readonly userService: UserService) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const assessment = await this.applicationService.getAssessment(req.user.token, req.params.id)
      const users = await this.userService.getUsers(
        req.user.token,
        ['assessor'],
        getQualificationsForApplication(assessment.application),
      )

      res.render('applications/allocations/show', {
        pageHeading: `Assessment for ${assessment.application.person.name}`,
        assessment,
        users,
      })
    }
  }
}

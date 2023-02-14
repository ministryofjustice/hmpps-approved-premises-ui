import type { Request, Response, RequestHandler } from 'express'
import { getQualificationsForApplication } from '../../../utils/applications/getQualificationsForApplication'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'

import { ApplicationService, UserService } from '../../../services'

import paths from '../../../paths/assess'

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
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      res.render('applications/allocations/show', {
        pageHeading: `Assessment for ${assessment.application.person.name}`,
        assessment,
        users,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { id } = req.params
      try {
        const assessment = await this.applicationService.allocate(req.user.token, req.params.id, req.body.userId)

        req.flash('success', `Case has been allocated to ${assessment.allocatedToStaffMember.name}`)
        res.redirect(paths.assessments.index({}))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.allocations.show({ id }))
      }
    }
  }
}

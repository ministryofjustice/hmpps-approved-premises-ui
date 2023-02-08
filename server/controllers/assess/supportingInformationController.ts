import { Request, Response, RequestHandler } from 'express'

import { AssessmentService } from '../../services'
import { DateFormats } from '../../utils/dateUtils'

import { oasysInformationFromAssessment } from '../../utils/assessments/oasysUtils'

export default class SupportingInformationController {
  constructor(private readonly assessmentService: AssessmentService) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const assessment = await this.assessmentService.findAssessment(req.user.token, req.params.id)

        const oasys = oasysInformationFromAssessment(assessment)

        res.render('assessments/pages/risk-information/oasys-information', {
          pageHeading: 'Review risk information',
          oasysSections: {
            roshSummary: oasys['rosh-summary'].roshSummaries,
            offenceDetails: oasys['offence-details'].offenceDetailsSummaries,
            supportingInformation: oasys['supporting-information'].supportingInformationSummaries,
            riskManagementPlan: oasys['risk-management-plan'].riskManagementSummaries,
            riskToSelf: oasys['risk-to-self'].riskToSelfSummaries,
          },
          dateOfImport: DateFormats.isoDateToUIDate(assessment.application.submittedAt),
          assessmentId: assessment.id,
          risks: assessment.application.risks,
        })
      }
    }
  }

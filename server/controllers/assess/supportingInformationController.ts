import { Request, RequestHandler, Response } from 'express'

import { AssessmentService } from '../../services'
import { DateFormats } from '../../utils/dateUtils'

import {
  acctAlertsFromAssessment,
  adjudicationsFromAssessment,
  caseNotesFromAssessment,
} from '../../utils/assessments/utils'
import { oasysInformationFromAssessment } from '../../utils/assessments/oasysUtils'

export default class SupportingInformationController {
  constructor(private readonly assessmentService: AssessmentService) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const assessment = await this.assessmentService.findAssessment(req.user.token, req.params.id)

      if (req.params.category === 'risk-information') {
        const oasys = oasysInformationFromAssessment(assessment) as unknown as {
          'rosh-summary': { roshSummaries: unknown }
          'offence-details': { offenceDetailsSummaries: unknown }
          'supporting-information': { supportingInformationSummaries: unknown }
          'risk-management-plan': { riskManagementSummaries: unknown }
          'risk-to-self': { riskToSelfSummaries: unknown }
        }

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
      } else {
        res.render('assessments/pages/risk-information/prison-information', {
          adjudications: adjudicationsFromAssessment(assessment),
          caseNotes: caseNotesFromAssessment(assessment),
          acctAlerts: acctAlertsFromAssessment(assessment),
          pageHeading: 'Prison information',
          dateOfImport: DateFormats.isoDateToUIDate(assessment.application.submittedAt),
          assessmentId: assessment.id,
        })
      }
    }
  }
}

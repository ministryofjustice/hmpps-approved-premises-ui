import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { OasysSummariesSection } from '../../@types/ui'
import { ApprovedPremisesAssessment as Assessment } from '../../@types/shared'

import {
  acctAlertFactory,
  adjudicationFactory,
  assessmentFactory,
  cas1OasysGroupFactory,
  prisonCaseNotesFactory,
} from '../../testutils/factories'

import SupportingInformationController from './supportingInformationController'
import { AssessmentService } from '../../services'
import { DateFormats } from '../../utils/dateUtils'

describe('supportingInformationController', () => {
  const token = 'SOME_TOKEN'
  const premisesId = 'premisesId'
  const flashSpy = jest.fn()

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const assessmentService = createMock<AssessmentService>({})

  let supportingInformationController: SupportingInformationController
  let request: DeepMocked<Request>

  beforeEach(() => {
    jest.resetAllMocks()
    supportingInformationController = new SupportingInformationController(assessmentService)
    request = createMock<Request>({
      user: { token },
      flash: flashSpy,
      params: { premisesId },
      headers: {
        referer: 'some-referrer/',
      },
    })
  })

  describe('show', () => {
    let assessment: Assessment
    beforeEach(() => {
      assessment = assessmentFactory.build()
    })

    describe('for "risk-information"', () => {
      let oasysImport: Record<string, OasysSummariesSection>

      it('renders the view', async () => {
        request.params.category = 'risk-information'

        oasysImport = {
          'offence-details': { offenceDetails: cas1OasysGroupFactory.offenceDetails().build().answers },
          'risk-to-self': { riskToSelf: cas1OasysGroupFactory.riskToSelf().build().answers },
          'rosh-summary': { roshSummary: cas1OasysGroupFactory.roshSummary().build().answers },
          'supporting-information': {
            supportingInformation: cas1OasysGroupFactory.supportingInformation().build().answers,
          },
          'risk-management-plan': { riskManagementPlan: cas1OasysGroupFactory.riskManagementPlan().build().answers },
        }
        assessment.application.data = {
          'oasys-import': { ...oasysImport },
        }

        assessmentService.findAssessment.mockResolvedValue(assessment)
        const requestHandler = supportingInformationController.show()

        await requestHandler(request, response, next)

        expect(response.render).toBeCalledWith('assessments/pages/risk-information/oasys-information', {
          assessmentId: assessment.id,
          dateOfImport: DateFormats.isoDateToUIDate(assessment.application?.submittedAt || ''),
          oasysSections: {
            roshSummary: oasysImport['rosh-summary'].roshSummaries,
            offenceDetails: oasysImport['offence-details'].offenceDetailsSummaries,
            supportingInformation: oasysImport['supporting-information'].supportingInformationSummaries,
            riskManagementPlan: oasysImport['risk-management-plan'].riskManagementSummaries,
            riskToSelf: oasysImport['risk-to-self'].riskToSelfSummaries,
          },
          risks: assessment.application.risks,
          pageHeading: 'Review risk information',
        })
        expect(assessmentService.findAssessment).toBeCalledWith(token, request.params.id)
      })
    })

    it('for "prison-information', async () => {
      const adjudications = adjudicationFactory.buildList(2)
      const caseNotes = prisonCaseNotesFactory.buildList(2)
      const acctAlerts = acctAlertFactory.buildList(2)

      assessment.application.data = {
        'prison-information': { 'case-notes': { adjudications, selectedCaseNotes: caseNotes, acctAlerts } },
      }
      assessmentService.findAssessment.mockResolvedValue(assessment)

      const requestHandler = supportingInformationController.show()
      await requestHandler(request, response, next)

      expect(response.render).toBeCalledWith('assessments/pages/risk-information/prison-information', {
        adjudications,
        caseNotes,
        acctAlerts,
        assessmentId: assessment.id,
        dateOfImport: DateFormats.isoDateToUIDate(assessment.application?.submittedAt || ''),
        pageHeading: 'Prison information',
      })
      expect(assessmentService.findAssessment).toBeCalledWith(token, request.params.id)
    })
  })
})

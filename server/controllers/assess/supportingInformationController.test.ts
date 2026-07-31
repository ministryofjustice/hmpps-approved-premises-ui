import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { OasysSummariesSection } from '../../@types/ui'
import { Cas1Assessment as Assessment } from '../../@types/shared'

import {
  acctAlertFactory,
  adjudicationFactory,
  assessmentFactory,
  cas1OasysGroupFactory,
  prisonCaseNotesFactory,
  risksFactory,
} from '../../testutils/factories'

import SupportingInformationController from './supportingInformationController'
import { AssessmentService, PersonService } from '../../services'
import { DateFormats } from '../../utils/dateUtils'
import config from '../../config'

describe('supportingInformationController', () => {
  const token = 'SOME_TOKEN'
  const premisesId = 'premisesId'
  const flashSpy = jest.fn()

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const assessmentService = createMock<AssessmentService>({})
  const personService = createMock<PersonService>({})

  let supportingInformationController: SupportingInformationController
  let request: DeepMocked<Request>

  beforeEach(() => {
    jest.resetAllMocks()
    supportingInformationController = new SupportingInformationController(assessmentService, personService)
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

      beforeEach(() => {
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
      })

      it('renders the view', async () => {
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

      describe('when the live tiers feature flag is enabled', () => {
        const liveRisks = risksFactory.build()

        beforeEach(() => {
          config.flags.useLiveTiers = true
          personService.riskProfile.mockResolvedValue(liveRisks)
        })

        afterEach(() => {
          config.flags.useLiveTiers = false
        })

        it('sources the risk widgets from the risk profile endpoint', async () => {
          const requestHandler = supportingInformationController.show()

          await requestHandler(request, response, next)

          expect(personService.riskProfile).toHaveBeenCalledWith(token, assessment.application.person.crn)
          expect(response.render).toHaveBeenCalledWith(
            'assessments/pages/risk-information/oasys-information',
            expect.objectContaining({ risks: liveRisks }),
          )
        })
      })

      describe('when the live tiers feature flag is disabled', () => {
        it('sources the risk widgets from the application risks and does not call the risk profile endpoint', async () => {
          const requestHandler = supportingInformationController.show()

          await requestHandler(request, response, next)

          expect(personService.riskProfile).not.toHaveBeenCalled()
          expect(response.render).toHaveBeenCalledWith(
            'assessments/pages/risk-information/oasys-information',
            expect.objectContaining({ risks: assessment.application.risks }),
          )
        })
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

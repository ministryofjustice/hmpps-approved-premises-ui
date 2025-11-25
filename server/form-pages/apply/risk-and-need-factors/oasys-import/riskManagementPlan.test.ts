import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { fromPartial } from '@total-typescript/shoehorn'
import { Cas1OASysAssessmentMetadata } from '@approved-premises/api'
import { PersonService } from '../../../../services'
import { applicationFactory, cas1OasysGroupFactory, risksFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'
import { oasysImportReponse } from '../../../../utils/oasysImportUtils'
import RiskManagementPlan from './riskManagementPlan'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'

jest.mock('../../../../services/personService.ts')

describe('RiskManagement', () => {
  const oasysGroup = cas1OasysGroupFactory.riskManagementPlan().build()
  const personRisks = risksFactory.build()
  const application = applicationFactory.build({ risks: personRisks })

  describe('initialize', () => {
    const getOasysGroupMock = jest.fn()
    let personService: DeepMocked<PersonService>

    beforeEach(() => {
      personService = createMock<PersonService>({
        getOasysAnswers: getOasysGroupMock,
      })
      getOasysGroupMock.mockResolvedValue(oasysGroup)
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('calls the getOasysSections and getPersonRisks method on the client with a token and the persons CRN', async () => {
      await RiskManagementPlan.initialize({}, application, 'some-token', fromPartial({ personService }))

      expect(getOasysGroupMock).toHaveBeenCalledWith('some-token', application.person.crn, 'riskManagementPlan', [])
    })

    it('adds the riskManagementSummaries and personRisks to the page object', async () => {
      const page = await RiskManagementPlan.initialize({}, application, 'some-token', fromPartial({ personService }))

      expect(page.riskManagementSummaries).toEqual(oasysGroup.answers)
      expect(page.risks).toEqual(mapApiPersonRisksForUi(personRisks))
      expect(page.oasysCompleted).toEqual(oasysGroup.assessmentMetadata.dateCompleted)
    })

    it('sets dateCompleted to dateStarted if dateCompleted is null', async () => {
      const assessmentMetadata: Cas1OASysAssessmentMetadata = {
        dateStarted: oasysGroup.assessmentMetadata.dateStarted,
        dateCompleted: null,
        hasApplicableAssessment: true,
      }
      getOasysGroupMock.mockResolvedValue({ ...oasysGroup, assessmentMetadata })

      const page = await RiskManagementPlan.initialize({}, application, 'some-token', fromPartial({ personService }))
      expect(page.oasysCompleted).toEqual(assessmentMetadata.dateStarted)
    })

    itShouldHaveNextValue(new RiskManagementPlan({}), 'risk-to-self')

    itShouldHavePreviousValue(new RiskManagementPlan({}), 'supporting-information')

    describe('errors', () => {
      it('should return an empty object', () => {
        const page = new RiskManagementPlan({})
        expect(page.errors()).toEqual({})
      })
    })

    describe('response', () => {
      it('calls oasysImportReponse with the correct arguments', () => {
        const answers = { '1': 'answer 1' }
        const summaries = [
          {
            questionNumber: '1',
            label: 'The first question',
            answer: 'Some answer for the first question',
          },
        ]
        const page = new RiskManagementPlan({ riskManagementAnswers: answers, riskManagementSummaries: summaries })
        const result = page.response()
        expect(result).toEqual(oasysImportReponse(answers, summaries))
      })
    })
  })
})

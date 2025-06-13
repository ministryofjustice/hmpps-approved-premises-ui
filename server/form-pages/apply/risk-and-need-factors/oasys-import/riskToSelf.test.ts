import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { fromPartial } from '@total-typescript/shoehorn'
import { Cas1OASysAssessmentMetadata } from '@approved-premises/api'
import { PersonService } from '../../../../services'
import { applicationFactory, cas1OasysGroupFactory, risksFactory } from '../../../../testutils/factories'
import { oasysImportReponse } from '../../../../utils/oasysImportUtils'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import RiskToSelf from './riskToSelf'

jest.mock('../../../../services/personService.ts')

describe('RiskToSelf', () => {
  const oasysGroup = cas1OasysGroupFactory.riskToSelf().build()
  const personRisks = risksFactory.build()
  const application = applicationFactory.build({ risks: personRisks })

  describe('initialize', () => {
    const getOasysGroupMock = jest.fn().mockResolvedValue(oasysGroup)

    let personService: DeepMocked<PersonService>

    beforeEach(() => {
      personService = createMock<PersonService>({
        getOasysAnswers: getOasysGroupMock,
      })
    })

    it('calls the getOasysSections  method on the client with a token and the persons CRN', async () => {
      await RiskToSelf.initialize({}, application, 'some-token', fromPartial({ personService }))

      expect(getOasysGroupMock).toHaveBeenCalledWith('some-token', application.person.crn, 'riskToSelf', [])
    })

    it('adds the riskToSelfSummaries and personRisks to the page object', async () => {
      const page = await RiskToSelf.initialize({}, application, 'some-token', fromPartial({ personService }))

      expect(page.riskToSelfSummaries).toEqual(oasysGroup.answers)
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

      const page = await RiskToSelf.initialize({}, application, 'some-token', fromPartial({ personService }))
      expect(page.oasysCompleted).toEqual(assessmentMetadata.dateStarted)
    })

    itShouldHaveNextValue(new RiskToSelf({}), '')

    itShouldHavePreviousValue(new RiskToSelf({}), 'risk-management-plan')

    describe('errors', () => {
      it('should return an empty object', () => {
        const page = new RiskToSelf({})
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
        const page = new RiskToSelf({ riskToSelfAnswers: answers, riskToSelfSummaries: summaries })
        const result = page.response()

        expect(result).toEqual(oasysImportReponse(answers, summaries))
      })
    })
  })
})

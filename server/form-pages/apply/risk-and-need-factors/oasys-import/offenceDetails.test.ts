import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { fromPartial } from '@total-typescript/shoehorn'
import { Cas1OASysAssessmentMetadata } from '@approved-premises/api'
import { PersonService } from '../../../../services'
import { applicationFactory, cas1OasysGroupFactory, risksFactory } from '../../../../testutils/factories'
import { oasysImportReponse } from '../../../../utils/oasysImportUtils'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'

import OffenceDetails from './offenceDetails'

jest.mock('../../../../services/personService.ts')

describe('OffenceDetails', () => {
  const oasysGroup = cas1OasysGroupFactory.build()
  const personRisks = risksFactory.build()
  const application = applicationFactory.build({ risks: personRisks })

  describe('initialize', () => {
    const getOasysAnswersMock = jest.fn()

    let personService: DeepMocked<PersonService>

    beforeEach(() => {
      personService = createMock<PersonService>({
        getOasysAnswers: getOasysAnswersMock,
      })
      getOasysAnswersMock.mockResolvedValue(oasysGroup)
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('calls the getOasysSections  method on the client with a token and the persons CRN', async () => {
      await OffenceDetails.initialize({}, application, 'some-token', fromPartial({ personService }))

      expect(getOasysAnswersMock).toHaveBeenCalledWith('some-token', application.person.crn, 'offenceDetails', [])
    })

    it('adds the offenceDetailsSummaries and personRisks to the page object', async () => {
      const page = await OffenceDetails.initialize({}, application, 'some-token', fromPartial({ personService }))

      expect(page.offenceDetailsSummaries).toEqual(oasysGroup.answers)
      expect(page.risks).toEqual(mapApiPersonRisksForUi(personRisks))
      expect(page.oasysCompleted).toEqual(oasysGroup.assessmentMetadata.dateCompleted)
    })

    it('sets dateCompleted to dateStarted if dateCompleted is null', async () => {
      const assessmentMetadata: Cas1OASysAssessmentMetadata = {
        dateStarted: oasysGroup.assessmentMetadata.dateStarted,
        dateCompleted: null,
        hasApplicableAssessment: true,
      }
      getOasysAnswersMock.mockResolvedValue({ ...oasysGroup, assessmentMetadata })

      const page = await OffenceDetails.initialize({}, application, 'some-token', fromPartial({ personService }))
      expect(page.oasysCompleted).toEqual(assessmentMetadata.dateStarted)
    })

    itShouldHaveNextValue(new OffenceDetails({}), 'supporting-information')

    itShouldHavePreviousValue(new OffenceDetails({}), 'rosh-summary')

    describe('errors', () => {
      it('should return an empty object', () => {
        const page = new OffenceDetails({})
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
        const page = new OffenceDetails({ offenceDetailsAnswers: answers, offenceDetailsSummaries: summaries })
        const result = page.response()

        expect(result).toEqual(oasysImportReponse(answers, summaries))
      })
    })
  })
})

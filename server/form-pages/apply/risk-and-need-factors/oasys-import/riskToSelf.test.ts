import { createMock, DeepMocked } from '@golevelup/ts-jest'
import { PersonService } from '../../../../services'
import applicationFactory from '../../../../testutils/factories/application'
import oasysSectionsFactory from '../../../../testutils/factories/oasysSections'
import risksFactory from '../../../../testutils/factories/risks'
import { oasysImportReponse } from '../../../../utils/oasysImportUtils'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import RiskToSelf from './riskToSelf'

jest.mock('../../../../services/personService.ts')

describe('RiskToSelf', () => {
  const oasysSections = oasysSectionsFactory.build()
  const personRisks = risksFactory.build()
  const application = applicationFactory.build({ risks: personRisks })

  describe('initialize', () => {
    const getOasysSectionsMock = jest.fn().mockResolvedValue(oasysSections)

    let personService: DeepMocked<PersonService>

    beforeEach(() => {
      personService = createMock<PersonService>({
        getOasysSections: getOasysSectionsMock,
      })
    })

    it('calls the getOasysSections  method on the client with a token and the persons CRN', async () => {
      await RiskToSelf.initialize({}, application, 'some-token', { personService })

      expect(getOasysSectionsMock).toHaveBeenCalledWith('some-token', application.person.crn)
    })

    it('adds the riskToSelfSummaries and personRisks to the page object', async () => {
      const page = await RiskToSelf.initialize({}, application, 'some-token', { personService })

      expect(page.riskToSelfSummaries).toEqual(oasysSections.riskToSelf)
      expect(page.risks).toEqual(mapApiPersonRisksForUi(personRisks))
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
        const answers = ['answer 1']
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

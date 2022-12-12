import { createMock, DeepMocked } from '@golevelup/ts-jest'
import { PersonService } from '../../../../services'
import applicationFactory from '../../../../testutils/factories/application'
import oasysSectionsFactory, { roshSummaryFactory } from '../../../../testutils/factories/oasysSections'
import risksFactory from '../../../../testutils/factories/risks'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import RoshSummary from './roshSummary'

jest.mock('../../../../services/personService.ts')

describe('RoshSummary', () => {
  const oasysSections = oasysSectionsFactory.build()
  const personRisks = risksFactory.build()
  const application = applicationFactory.build()

  describe('initialize', () => {
    const getOasysSectionsMock = jest.fn().mockResolvedValue(oasysSections)
    const getPersonRisksMock = jest.fn().mockResolvedValue(personRisks)
    let personService: DeepMocked<PersonService>

    beforeEach(() => {
      personService = createMock<PersonService>({
        getOasysSections: getOasysSectionsMock,
        getPersonRisks: getPersonRisksMock,
      })
    })

    it('calls the getOasysSections and getPersonRisks method on the client with a token and the persons CRN', async () => {
      await RoshSummary.initialize({}, application, 'some-token', { personService })

      expect(getOasysSectionsMock).toHaveBeenCalledWith('some-token', application.person.crn)
      expect(getPersonRisksMock).toHaveBeenCalledWith('some-token', application.person.crn)
    })

    it('adds the roshSummary and personRisks to the page object', async () => {
      const page = await RoshSummary.initialize({}, application, 'some-token', { personService })

      expect(page.roshSummary).toEqual(oasysSections.roshSummary)
      expect(page.risks).toEqual(personRisks)
    })

    itShouldHaveNextValue(new RoshSummary({}), '')

    itShouldHavePreviousValue(new RoshSummary({}), 'optional-oasys-sections')

    describe('errors', () => {
      it('should return an empty object', () => {
        const page = new RoshSummary({})
        expect(page.errors()).toEqual({})
      })
    })

    describe('response', () => {
      it('returns a human readable response for reach question', () => {
        const roshSummaries = roshSummaryFactory.buildList(3)
        const page = new RoshSummary({
          roshAnswers: ['answer 1', 'answer 2', 'answer 3'],
          roshSummaries,
        })

        expect(page.response()).toEqual({
          [`${roshSummaries[0].questionNumber}. ${roshSummaries[0].label}`]: 'answer 1',
          [`${roshSummaries[1].questionNumber}. ${roshSummaries[1].label}`]: 'answer 2',
          [`${roshSummaries[2].questionNumber}. ${roshSummaries[2].label}`]: 'answer 3',
        })
      })

      it('returns no response when there arent any questions', () => {
        const page = new RoshSummary({})

        expect(page.response()).toEqual({})
      })

      describe('roshTextAreas', () => {
        it('it returns reoffending needs as textareas', () => {
          const roshSummaries = roshSummaryFactory.buildList(2)
          const page = new RoshSummary({})
          page.roshSummary = roshSummaries
          const items = page.roshTextAreas()

          expect(items).toMatchStringIgnoringWhitespace(`
        <div class="govuk-form-group">
        <h3 class="govuk-label-wrapper">
            <label class="govuk-label govuk-label--m" for=roshAnswers[${roshSummaries[0].questionNumber}]>
                ${roshSummaries[0].label}
            </label>
        </h3>
        <textarea class="govuk-textarea" id=roshAnswers[${roshSummaries[0].questionNumber}] name=roshAnswers[${roshSummaries[0].questionNumber}] rows="8">${roshSummaries[0].answer}</textarea>
    </div>
    <hr>
    <div class="govuk-form-group">
    <h3 class="govuk-label-wrapper">
        <label class="govuk-label govuk-label--m" for=roshAnswers[${roshSummaries[1].questionNumber}]>
            ${roshSummaries[1].label}
        </label>
    </h3>
    <textarea class="govuk-textarea" id=roshAnswers[${roshSummaries[1].questionNumber}] name=roshAnswers[${roshSummaries[1].questionNumber}] rows="8">${roshSummaries[1].answer}</textarea>
</div>
<hr>`)
        })
      })
    })
  })
})

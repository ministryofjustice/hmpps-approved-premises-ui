import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { fromPartial } from '@total-typescript/shoehorn'
import { PersonService } from '../../../../services'
import {
  applicationFactory,
  oasysSectionsFactory,
  oasysSelectionFactory,
  risksFactory,
} from '../../../../testutils/factories'
import { oasysImportReponse } from '../../../../utils/oasysImportUtils'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import SupportingInformation from './supportingInformation'

jest.mock('../../../../services/personService.ts')

describe('SupportingInformation', () => {
  const oasysSections = oasysSectionsFactory.build()
  const personRisks = risksFactory.build()
  let application = applicationFactory.withOptionalOasysSectionsSelected([], []).build({ risks: personRisks })

  describe('initialize', () => {
    const getOasysSectionsMock = jest.fn()

    let personService: DeepMocked<PersonService>

    beforeEach(() => {
      personService = createMock<PersonService>({
        getOasysSections: getOasysSectionsMock,
      })
      getOasysSectionsMock.mockResolvedValue(oasysSections)
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('calls the getOasysSections and getPersonRisks method on the client with a token and the persons CRN', async () => {
      const needsLinkedToReoffending = oasysSelectionFactory.needsLinkedToReoffending().build({ section: 1 })
      const otherNeeds = oasysSelectionFactory.needsNotLinkedToReoffending().build({ section: 2 })
      application = applicationFactory
        .withOptionalOasysSectionsSelected([needsLinkedToReoffending], [otherNeeds])
        .build({ risks: personRisks })

      await SupportingInformation.initialize({}, application, 'some-token', fromPartial({ personService }))

      expect(getOasysSectionsMock).toHaveBeenCalledWith('some-token', application.person.crn, [1, 2])
    })

    it('adds the supportingInformationSummaries and personRisks to the page object', async () => {
      const page = await SupportingInformation.initialize({}, application, 'some-token', fromPartial({ personService }))

      expect(page.supportingInformationSummaries).toEqual(oasysSections.supportingInformation)
      expect(page.risks).toEqual(mapApiPersonRisksForUi(personRisks))
      expect(page.oasysCompleted).toEqual(oasysSections.dateCompleted)
    })

    it('sets dateCompleted to dateStarted if dateCompleted is null', async () => {
      getOasysSectionsMock.mockResolvedValue({ ...oasysSections, dateCompleted: null })

      const page = await SupportingInformation.initialize({}, application, 'some-token', fromPartial({ personService }))
      expect(page.oasysCompleted).toEqual(oasysSections.dateStarted)
    })

    itShouldHaveNextValue(new SupportingInformation({}), 'risk-management-plan')

    itShouldHavePreviousValue(new SupportingInformation({}), 'offence-details')

    describe('errors', () => {
      it('should return an empty object', () => {
        const page = new SupportingInformation({})
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
        const page = new SupportingInformation({
          supportingInformationAnswers: answers,
          supportingInformationSummaries: summaries,
        })
        const result = page.response()

        expect(result).toEqual(oasysImportReponse(answers, summaries))
      })
    })
  })
})

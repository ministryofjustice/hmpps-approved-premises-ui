import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { OasysPage } from '@approved-premises/ui'
import { fromPartial } from '@total-typescript/shoehorn'
import { offenceDetailsFactory } from '../testutils/factories/oasysSections'
import PersonService, { OasysNotFoundError } from '../services/personService'
import {
  applicationFactory,
  oasysSectionsFactory,
  oasysSelectionFactory,
  risksFactory,
  roshSummaryFactory,
} from '../testutils/factories'
import { mapApiPersonRisksForUi, sentenceCase } from './utils'
import {
  Constructor,
  fetchOptionalOasysSections,
  findSummaryLabel,
  getOasysSections,
  oasysImportReponse,
  sectionCheckBoxes,
  sortOasysImportSummaries,
  textareas,
} from './oasysImportUtils'
import oasysStubs from '../data/stubs/oasysStubs.json'
import { PersonRisks } from '../@types/shared'
import { logToSentry } from '../../logger'

jest.mock('../../logger.ts')

describe('OASysImportUtils', () => {
  describe('getOasysSections', () => {
    let getOasysSectionsMock: jest.Mock
    let personService: DeepMocked<PersonService>
    let constructor: DeepMocked<Constructor<OasysPage>>

    afterEach(() => {
      jest.resetAllMocks()
    })

    beforeEach(() => {
      constructor = createMock<Constructor<OasysPage>>(
        jest.fn().mockImplementation(() => ({ body: {} }) as unknown as OasysPage),
      )
      getOasysSectionsMock = jest.fn()
      personService = createMock<PersonService>({
        getOasysSections: getOasysSectionsMock,
      })
    })

    it('sets oasysSuccess to false along with the stubs if there is an OasysNotFoundError', async () => {
      const personRisks = risksFactory.build()
      const application = applicationFactory.build({ risks: personRisks })

      getOasysSectionsMock.mockImplementation(() => {
        throw new OasysNotFoundError()
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await getOasysSections(
        {},
        application,
        'some-token',
        fromPartial({ personService }),
        constructor,
        {
          sectionName: 'offenceDetails',
          summaryKey: 'offenceDetailsSummary',
          answerKey: 'offenceDetailsAnswers',
        },
      )

      expect(result.oasysSuccess).toEqual(false)
      expect(result.body.offenceDetailsSummary).toEqual(sortOasysImportSummaries(oasysStubs.offenceDetails))
      expect(result.offenceDetailsSummary).toEqual(oasysStubs.offenceDetails)
      expect(result.risks).toEqual(mapApiPersonRisksForUi(application.risks as PersonRisks))
    })

    it('sets oasysSuccess to true along with the marshalled oasys data if there is not an OasysNotFoundError', async () => {
      const personRisks = risksFactory.build()
      const application = applicationFactory.build({ risks: personRisks })

      const oasysSections = oasysSectionsFactory.build()

      getOasysSectionsMock.mockResolvedValue(oasysSections)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await getOasysSections(
        {},
        application,
        'some-token',
        fromPartial({ personService }),
        constructor,
        {
          sectionName: 'offenceDetails',
          summaryKey: 'offenceDetailsSummary',
          answerKey: 'offenceDetailsAnswers',
        },
      )

      expect(result.oasysSuccess).toEqual(true)
      expect(result.body.offenceDetailsSummary).toEqual(sortOasysImportSummaries(oasysSections.offenceDetails))
      expect(result.offenceDetailsSummary).toEqual(oasysSections.offenceDetails)
      expect(result.risks).toEqual(mapApiPersonRisksForUi(application.risks as PersonRisks))
    })

    it('prioritises the body over the Oasys data if the body is provided', async () => {
      const personRisks = risksFactory.build()
      const application = applicationFactory.build({ risks: personRisks })

      const offenceDetails = [
        offenceDetailsFactory.build({ questionNumber: '1' }),
        offenceDetailsFactory.build({ questionNumber: '2' }),
      ]

      const oasysSections = oasysSectionsFactory.build({
        offenceDetails,
      })

      getOasysSectionsMock.mockResolvedValue(oasysSections)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await getOasysSections(
        { offenceDetailsAnswers: { '1': 'My Response' } },
        application,
        'some-token',
        fromPartial({ personService }),
        constructor,
        {
          sectionName: 'offenceDetails',
          summaryKey: 'offenceDetailsSummary',
          answerKey: 'offenceDetailsAnswers',
        },
      )

      expect(result.body.offenceDetailsSummary).toEqual([
        { answer: 'My Response', label: offenceDetails[0].label, questionNumber: offenceDetails[0].questionNumber },
        {
          answer: offenceDetails[1].answer,
          label: offenceDetails[1].label,
          questionNumber: offenceDetails[1].questionNumber,
        },
      ])
    })
  })

  describe('textareas', () => {
    it('it returns reoffending needs as textareas', () => {
      const roshSummaries = roshSummaryFactory.buildList(2)
      const sectionName = 'roshAnswers'
      const result = textareas(roshSummaries, sectionName)

      expect(result).toMatchStringIgnoringWhitespace(`
              <div class="govuk-form-group">
              <h2 class="govuk-label-wrapper">
                  <label class="govuk-label govuk-label--m" for=${sectionName}[${roshSummaries[0].questionNumber}]>
                      ${roshSummaries[0].label}
                  </label>
              </h2>
              <textarea class="govuk-textarea" id=${sectionName}[${roshSummaries[0].questionNumber}] name=${sectionName}[${roshSummaries[0].questionNumber}] rows="8">${roshSummaries[0].answer}</textarea>
          </div>
          <hr>
          <div class="govuk-form-group">
          <h2 class="govuk-label-wrapper">
              <label class="govuk-label govuk-label--m" for=${sectionName}[${roshSummaries[1].questionNumber}]>
                  ${roshSummaries[1].label}
              </label>
          </h2>
          <textarea class="govuk-textarea" id=${sectionName}[${roshSummaries[1].questionNumber}] name=${sectionName}[${roshSummaries[1].questionNumber}] rows="8">${roshSummaries[1].answer}</textarea>
      </div>
      <hr>`)
    })
  })

  describe('oasysImportReponse', () => {
    it('returns a human readable response for reach question', () => {
      const answers = { Q1: 'answer 1', Q2: 'answer 2', Q3: 'answer 3' }
      const summaries = [
        {
          questionNumber: 'Q1',
          label: 'The first question',
          answer: 'Some answer for the first question',
        },
        {
          questionNumber: 'Q2',
          label: 'The second question',
          answer: 'Some answer for the second question',
        },
        {
          questionNumber: 'Q3',
          label: 'The third question',
          answer: 'Some answer for the third question',
        },
      ]
      const result = oasysImportReponse(answers, summaries)

      expect(result).toEqual({
        [`Q1: The first question`]: `answer 1`,
        [`Q2: The second question`]: `answer 2`,
        [`Q3: The third question`]: `answer 3`,
      })
    })

    it('returns no response when there arent any questions', () => {
      const result = oasysImportReponse({}, [])

      expect(result).toEqual({})
    })
  })

  describe('findSummaryLabel', () => {
    it('returns a summary if one exists', () => {
      expect(findSummaryLabel('2.1', oasysStubs.offenceDetails)).toBe(oasysStubs.offenceDetails[0].label)
    })

    it('calls logToSentry and returns an empty string if a summary is not find', () => {
      expect(findSummaryLabel('1', [{ questionNumber: '20', label: 'some label' }])).toBe('')
      expect(logToSentry).toHaveBeenCalledWith(
        'OASys summary not found for question number: 1. Summaries [{"questionNumber":"20","label":"some label"}]',
      )
    })
  })

  describe('fetchOptionalOasysSections', () => {
    it('returns an error if the application doesnt have an OASys section', () => {
      const application = applicationFactory.build()
      expect(() => fetchOptionalOasysSections(application)).toThrow(
        'Oasys supporting information error: Error: No OASys import section',
      )
    })
    it('returns an error if the application doesnt have any optional OASys imports', () => {
      const application = applicationFactory.build({
        data: {
          'oasys-import': {
            'optional-oasys-sections': null,
          },
        },
      })

      expect(() => fetchOptionalOasysSections(application)).toThrow(
        'Oasys supporting information error: Error: No optional OASys imports',
      )
    })

    it('returns the optional OASys sections to import if they exist', () => {
      const application = applicationFactory
        .withOptionalOasysSectionsSelected(
          oasysSelectionFactory.needsLinkedToReoffending().buildList(1, { section: 1 }),
          oasysSelectionFactory.needsNotLinkedToReoffending().buildList(1, { section: 2 }),
        )
        .build()

      expect(fetchOptionalOasysSections(application)).toEqual([1, 2])
    })

    it('filters out null sections', () => {
      const application = applicationFactory.build()
      application.data = {}
      application.data['oasys-import'] = {
        'optional-oasys-sections': {
          needsLinkedToReoffending: [null, null],
          otherNeeds: [null],
        },
      }

      expect(fetchOptionalOasysSections(application)).toEqual([])
    })
  })

  describe('sortOasysImportSummaries', () => {
    it('sorts the imports into order of questions', () => {
      const oasysSummary1 = roshSummaryFactory.build({ questionNumber: '1' })
      const oasysSummary2 = roshSummaryFactory.build({ questionNumber: '2' })
      const oasysSummary3 = roshSummaryFactory.build({ questionNumber: '3' })

      const result = sortOasysImportSummaries([oasysSummary3, oasysSummary2, oasysSummary1])
      expect(result).toEqual([oasysSummary1, oasysSummary2, oasysSummary3])
    })

    it('removes non-numeric ', () => {
      const oasysSummary1 = roshSummaryFactory.build({ questionNumber: 'AB1' })
      const oasysSummary2 = roshSummaryFactory.build({ questionNumber: 'AB2' })
      const oasysSummary3 = roshSummaryFactory.build({ questionNumber: 'AB3' })

      const result = sortOasysImportSummaries([oasysSummary3, oasysSummary2, oasysSummary1])
      expect(result).toEqual([oasysSummary1, oasysSummary2, oasysSummary3])
    })
  })

  describe('sectionCheckBoxes', () => {
    const needLinkedToReoffendingA = oasysSelectionFactory
      .needsLinkedToReoffending()
      .build({ section: 1, name: 'emotional' })
    const needLinkedToReoffendingB = oasysSelectionFactory.needsLinkedToReoffending().build({ section: 2 })
    const needLinkedToReoffendingC = oasysSelectionFactory.needsLinkedToReoffending().build({ section: 3 })

    it('it returns needs as checkbox items', () => {
      const items = sectionCheckBoxes(
        [needLinkedToReoffendingA, needLinkedToReoffendingB, needLinkedToReoffendingC],
        [needLinkedToReoffendingA],
      )

      expect(items).toEqual([
        {
          checked: true,
          text: `1. ${sentenceCase(needLinkedToReoffendingA.name)}`,
          value: '1',
        },
        {
          checked: false,
          text: `2. ${sentenceCase(needLinkedToReoffendingB.name)}`,
          value: '2',
        },
        {
          checked: false,
          text: `3. ${sentenceCase(needLinkedToReoffendingC.name)}`,
          value: '3',
        },
      ])
    })

    it('does not throw if some selected sections are null', () => {
      const items = sectionCheckBoxes([needLinkedToReoffendingA], [null])

      expect(items).toEqual([
        {
          checked: false,
          text: `1. ${sentenceCase(needLinkedToReoffendingA.name)}`,
          value: '1',
        },
      ])
    })
  })
})

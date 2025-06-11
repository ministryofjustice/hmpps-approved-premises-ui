import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { OasysPage } from '@approved-premises/ui'
import { fromPartial } from '@total-typescript/shoehorn'
import PersonService, { OasysNotFoundError } from '../services/personService'
import {
  applicationFactory,
  cas1OasysGroupFactory,
  cas1OASysSupportingInformationMetaDataFactory,
  oasysQuestionFactory,
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
import { Cas1OASysGroup, PersonRisks } from '../@types/shared'
import { logToSentry } from '../../logger'

jest.mock('../../logger.ts')

type OasysOffencePage = OasysPage & { offenceDetailsSummary: Cas1OASysGroup }

describe('OASysImportUtils', () => {
  describe('getOasysSections', () => {
    let getOasysGroupMock: jest.Mock
    let personService: DeepMocked<PersonService>
    let constructor: DeepMocked<Constructor<OasysOffencePage>>

    afterEach(() => {
      jest.resetAllMocks()
    })

    beforeEach(() => {
      constructor = createMock<Constructor<OasysOffencePage>>(
        jest.fn().mockImplementation(() => ({ body: {} }) as unknown as OasysOffencePage),
      )
      getOasysGroupMock = jest.fn()
      personService = createMock<PersonService>({
        getOasysAnswers: getOasysGroupMock,
      })
    })

    it('sets oasysSuccess to false along with the stubs if there is an OasysNotFoundError', async () => {
      const personRisks = risksFactory.build()
      const application = applicationFactory.build({ risks: personRisks })

      getOasysGroupMock.mockImplementation(() => {
        throw new OasysNotFoundError()
      })

      const result = await getOasysSections<OasysOffencePage>(
        {},
        application,
        'some-token',
        fromPartial({ personService }),
        constructor,
        {
          groupName: 'offenceDetails',
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

      const oasysSections = cas1OasysGroupFactory.build()

      getOasysGroupMock.mockResolvedValue(oasysSections)

      const result = await getOasysSections<OasysOffencePage>(
        {},
        application,
        'some-token',
        fromPartial({ personService }),
        constructor,
        {
          groupName: 'offenceDetails',
          summaryKey: 'offenceDetailsSummary',
          answerKey: 'offenceDetailsAnswers',
        },
      )

      expect(result.oasysSuccess).toEqual(true)
      expect(result.body.offenceDetailsSummary).toEqual(sortOasysImportSummaries(oasysSections.answers))
      expect(result.offenceDetailsSummary).toEqual(oasysSections.answers)
      expect(result.risks).toEqual(mapApiPersonRisksForUi(application.risks as PersonRisks))
    })

    it('prioritises the body over the Oasys data if the body is provided', async () => {
      const personRisks = risksFactory.build()
      const application = applicationFactory.build({ risks: personRisks })

      const questions = [
        oasysQuestionFactory.build({ questionNumber: '1' }),
        oasysQuestionFactory.build({ questionNumber: '2' }),
      ]

      const oasysGroup = cas1OasysGroupFactory.build({
        answers: questions,
      })

      getOasysGroupMock.mockResolvedValue(oasysGroup)

      const result = await getOasysSections<OasysOffencePage>(
        { offenceDetailsAnswers: { '1': 'My Response' } },
        application,
        'some-token',
        fromPartial({ personService }),
        constructor,
        {
          groupName: 'offenceDetails',
          summaryKey: 'offenceDetailsSummary',
          answerKey: 'offenceDetailsAnswers',
        },
      )

      expect(result.body.offenceDetailsSummary).toEqual([
        { answer: 'My Response', label: questions[0].label, questionNumber: questions[0].questionNumber },
        {
          answer: questions[1].answer,
          label: questions[1].label,
          questionNumber: questions[1].questionNumber,
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
          cas1OASysSupportingInformationMetaDataFactory.needsLinkedToReoffending().buildList(1, { section: 1 }),
          cas1OASysSupportingInformationMetaDataFactory.needsNotLinkedToReoffending().buildList(1, { section: 2 }),
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
    const needLinkedToReoffendingA = cas1OASysSupportingInformationMetaDataFactory
      .needsLinkedToReoffending()
      .build({ section: 1, sectionLabel: 'emotional' })
    const needLinkedToReoffendingB = cas1OASysSupportingInformationMetaDataFactory
      .needsLinkedToReoffending()
      .build({ section: 2 })
    const needLinkedToReoffendingC = cas1OASysSupportingInformationMetaDataFactory
      .needsLinkedToReoffending()
      .build({ section: 3 })

    it('it returns needs as checkbox items', () => {
      const items = sectionCheckBoxes(
        [needLinkedToReoffendingA, needLinkedToReoffendingB, needLinkedToReoffendingC],
        [needLinkedToReoffendingA],
      )

      expect(items).toEqual([
        {
          checked: true,
          text: `1. ${sentenceCase(needLinkedToReoffendingA.sectionLabel)}`,
          value: '1',
        },
        {
          checked: false,
          text: `2. ${sentenceCase(needLinkedToReoffendingB.sectionLabel)}`,
          value: '2',
        },
        {
          checked: false,
          text: `3. ${sentenceCase(needLinkedToReoffendingC.sectionLabel)}`,
          value: '3',
        },
      ])
    })

    it('does not throw if some selected sections are null', () => {
      const items = sectionCheckBoxes([needLinkedToReoffendingA], [null])

      expect(items).toEqual([
        {
          checked: false,
          text: `1. ${sentenceCase(needLinkedToReoffendingA.sectionLabel)}`,
          value: '1',
        },
      ])
    })
  })
})

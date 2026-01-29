import { render } from 'nunjucks'
import { Adjudication, CsraSummary } from '@approved-premises/api'
import { subYears } from 'date-fns'
import { CsraClassification, csraClassificationMapping, ResidentProfileSubTab } from './index'
import {
  licenseCards,
  offenceCards,
  sentenceSideNavigation,
  additionalOffencesRows,
  offencesTabCards,
  csraRows,
} from './sentenceUtils'
import * as sentenceFns from './sentenceUtils'
import {
  activeOffenceFactory,
  adjudicationFactory,
  cas1OasysGroupFactory,
  cas1SpaceBookingFactory,
  csraSummaryFactory,
  licenceFactory,
} from '../../testutils/factories'
import { DateFormats } from '../dateUtils'
import { sentenceCase } from '../utils'
import {
  additionalConditionFactory,
  bespokeConditionFactory,
  standardConditionFactory,
} from '../../testutils/factories/licenceConditions'
import { fullPersonFactory } from '../../testutils/factories/person'
import { bulletList } from '../formUtils'
import { oasysMetadataRow } from './riskUtils'

jest.mock('nunjucks')

const crn = 'S123456'

describe('sentence', () => {
  const offences = [
    ...activeOffenceFactory.buildList(5, { mainOffence: false }),
    activeOffenceFactory.build({ mainOffence: true }),
  ]
  const oasysAnswers = cas1OasysGroupFactory.offenceDetails().build()
  oasysAnswers.answers[0].questionNumber = '2.1'
  oasysAnswers.answers[1].questionNumber = '2.12'

  const indexOffence = offences[5]

  beforeEach(() => {
    jest.restoreAllMocks()
    ;(render as jest.Mock).mockReturnValue('rendered-output')
  })

  describe('sentenceSideNavigation', () => {
    it('Builds the side navigation for the sentence tab', () => {
      const subTab: ResidentProfileSubTab = 'offence'
      const placement = cas1SpaceBookingFactory.build()
      const basePath: string = `/manage/resident/${crn}/placement/${placement.id}/sentence/`

      expect(sentenceSideNavigation(subTab, crn, placement.id)).toEqual([
        {
          active: true,
          href: `${basePath}offence`,
          text: 'Offence details',
        },
        {
          active: false,
          href: `${basePath}licence`,
          text: 'Licence',
        },
        {
          active: false,
          href: `${basePath}prison`,
          text: 'Prison',
        },
      ])
    })
  })

  describe('offenceCards', () => {
    it('should render the offence summary list', () => {
      expect(offenceCards(offences, 'success')).toEqual([
        {
          card: { title: { text: 'Offence' } },
          rows: [
            { key: { text: 'Offence type' }, value: { text: indexOffence.mainCategoryDescription } },
            { key: { text: 'Sub-category' }, value: { text: indexOffence.subCategoryDescription } },
            {
              key: { text: 'Date of offence' },
              value: { text: DateFormats.isoDateToUIDate(indexOffence.offenceDate) },
            },
            { key: { text: 'Offence ID' }, value: { text: indexOffence.offenceId } },
            { key: { text: 'NDelius Event number' }, value: { text: indexOffence.deliusEventNumber } },
          ],
        },
        {
          card: { title: { text: 'Additional offences' } },
          table: {
            head: [{ text: 'Main category' }, { text: 'Sub-category' }, { text: 'Date of offence' }],
            rows: additionalOffencesRows(offences, indexOffence),
          },
        },
      ])
    })

    it(`should not show duplicated sub-category`, async () => {
      const offence = activeOffenceFactory.build({ mainOffence: true })
      offence.subCategoryDescription = offence.mainCategoryDescription
      expect(offenceCards([offence], 'success')[0].rows).toEqual(
        expect.arrayContaining([
          { key: { text: 'Offence type' }, value: { text: offence.mainCategoryDescription } },
          { key: { text: 'Sub-category' }, value: { text: '' } },
        ]),
      )
    })

    it(`should show an empty additional offences card`, async () => {
      const offence = activeOffenceFactory.build({ mainOffence: true })
      offence.subCategoryDescription = offence.mainCategoryDescription
      expect(offenceCards([offence], 'success')[1].html).toEqual('No additional offences')
    })
  })

  describe('additionalOffencesRows', () => {
    it('builds rows for the additional offences table', () => {
      const mainOffence = activeOffenceFactory.build({ mainOffence: true })
      const additionalOffence = activeOffenceFactory.build({ mainOffence: false })
      expect(additionalOffencesRows([mainOffence, additionalOffence], mainOffence)).toEqual([
        [
          { text: additionalOffence.mainCategoryDescription },
          { text: additionalOffence.subCategoryDescription },
          { text: DateFormats.isoDateToUIDate(additionalOffence.offenceDate, { format: 'short' }) },
        ],
      ])
    })
  })

  describe('oasysOffenceCards', () => {
    it('renders the oasys offences cards when there is a valid assessment', () => {
      expect(sentenceFns.oasysOffenceCards(oasysAnswers)).toEqual([
        {
          card: {
            title: {
              text: 'Offence analysis',
            },
          },
          html: `${oasysMetadataRow('2.1', 'Offence details', oasysAnswers)}rendered-output`,
        },
        {
          card: {
            title: {
              text: 'Victim - perpetrator relationship',
            },
          },
          html: `${oasysMetadataRow('2.12', 'Offence details', oasysAnswers)}rendered-output`,
        },
      ])

      expect(render).toHaveBeenCalledWith('partials/detailsBlock.njk', {
        summaryText: 'View information',
        text: oasysAnswers.answers[0].answer,
      })
      expect(render).toHaveBeenCalledWith('partials/detailsBlock.njk', {
        summaryText: 'View information',
        text: oasysAnswers.answers[1].answer,
      })
    })

    //     it.each([
    //       ['there is no assessment', 'notFound'],
    //       ['the assessment is undefined', 'failure'],
    //     ])('should render if %s', ([_, callResult]) => {
    //       const result = offencesTabCards(offences, cas1OasysGroupFactory.noAssessment().build(), ['notFound', callResult as CallResult])
    //       expect(result[2].rows[0].key).toEqual({
    //         html: `Offence analysis
    // <p class="govuk-body-s">OASys question 2.1 not available</p>`,
    //       })
    //       expect(result[3].rows[0].key).toEqual({
    //         html: `Previous behaviours
    // <p class="govuk-body-s">OASys question 2.12 not available</p>`,
    //       })
    //     })
  })

  describe('csraRows', () => {
    const expectedSummary = (summary: CsraSummary) => [
      { text: DateFormats.isoDateToUIDate(summary.assessmentDate, { format: 'short' }) },
      { text: csraClassificationMapping[summary.classificationCode as CsraClassification] },
      { text: summary.assessmentComment },
    ]

    const subtractYears = (csraSummaries: Array<CsraSummary>): Array<CsraSummary> =>
      csraSummaries.map(summary => ({
        ...summary,
        assessmentDate: DateFormats.dateObjToIsoDate(subYears(summary.assessmentDate, 3)),
      }))

    const orderByDate = (a: CsraSummary, b: CsraSummary) => (a.assessmentDate > b.assessmentDate ? -1 : 1)

    it('should render a csra row', () => {
      const csraSummaries = csraSummaryFactory.buildList(2)
      expect(csraRows(csraSummaries)).toEqual(csraSummaries.map(expectedSummary))
    })

    it('should chop off any assessments that are older than three years', () => {
      const oldAssessments = subtractYears(csraSummaryFactory.buildList(3))
      const newAssessments = csraSummaryFactory.buildList(5)
      const rows = csraRows([...oldAssessments, ...newAssessments])
      expect(rows).toHaveLength(5)
      expect(rows).toEqual(newAssessments.sort(orderByDate).map(expectedSummary))
    })

    it('should render the most recent if all are older than three years', () => {
      const oldAssessments = subtractYears(csraSummaryFactory.buildList(5))
      const rows = csraRows(oldAssessments)
      expect(rows).toHaveLength(1)
      expect(rows[0]).toEqual(expectedSummary(oldAssessments.sort(orderByDate)[0]))
    })
  })

  describe('offencesTabCards', () => {
    it('should render the offence cards', () => {
      jest.spyOn(sentenceFns, 'offenceCards').mockReturnValue([])
      jest.spyOn(sentenceFns, 'oasysOffenceCards').mockReturnValue([])

      expect(offencesTabCards(offences, oasysAnswers, ['success', 'success'])).toEqual([])
      expect(sentenceFns.offenceCards).toHaveBeenCalledWith(offences, 'success')
      expect(sentenceFns.oasysOffenceCards).toHaveBeenCalledWith(oasysAnswers)
    })
  })

  describe('sentenceSideNavigation', () => {
    it('should render the side navigation', () => {
      const baseUrl = '/manage/resident/crn/placement/placementId/sentence/'
      expect(sentenceSideNavigation('licence', 'crn', 'placementId')).toEqual([
        { active: false, href: `${baseUrl}offence`, text: 'Offence details' },
        { active: true, href: `${baseUrl}licence`, text: 'Licence' },
        { active: false, href: `${baseUrl}prison`, text: 'Prison' },
      ])
    })
  })

  describe('licenceCards', () => {
    it('should render the licence cards', () => {
      const standardCondition = standardConditionFactory.build()
      const bespokeCondition = bespokeConditionFactory.build()
      const additionalCondition = additionalConditionFactory.build()
      const pssAdditionalConditions = additionalConditionFactory.buildList(2, { category: 'Category' })

      const licence = licenceFactory.build({
        conditions: {
          AP: { standard: [standardCondition], bespoke: [bespokeCondition], additional: [additionalCondition] },
          PSS: { standard: [], additional: pssAdditionalConditions },
        },
      })

      expect(licenseCards(licence, 'success')).toEqual([
        { html: 'rendered-output' },
        {
          card: { title: { text: 'Licence overview' } },
          rows: [
            {
              key: { text: 'Licence start date' },
              value: { text: DateFormats.isoDateToUIDate(licence.licenceStartDate) },
            },
            {
              key: { text: 'Licence approved date' },
              value: { text: DateFormats.isoDateToUIDate(licence.approvedDateTime) },
            },
            { key: { text: 'Last updated' }, value: { text: DateFormats.isoDateToUIDate(licence.updatedDateTime) } },
          ],
        },
        {
          card: { title: { text: 'Licence conditions' } },
          table: {
            head: [{ text: 'Type' }, { text: 'Condition' }],
            rows: [
              [{ text: 'Standard' }, { text: standardCondition.text }],
              [
                { text: 'Additional' },
                { html: `<strong>${additionalCondition.category}</strong><br>${additionalCondition.text}` },
              ],
              [{ text: 'Bespoke' }, { text: bespokeCondition.text }],
            ],
          },
        },
        {
          card: { title: { text: 'Post-sentence supervision requirements' } },
          table: {
            head: [{ text: 'Type' }, { text: 'Requirement' }],
            rows: [
              [
                { text: 'Additional' },
                { html: `<strong>Category</strong><br>${bulletList(pssAdditionalConditions.map(({ text }) => text))}` },
              ],
            ],
          },
        },
      ])
    })
  })

  describe('prisonCards', () => {
    it('should render the adjudications table rows', () => {
      const adjudications: Array<Adjudication> = adjudicationFactory.buildList(2)

      expect(sentenceFns.adjudicationRows(adjudications)).toEqual([
        [
          { text: DateFormats.isoDateToUIDate(adjudications[0].reportedAt, { format: 'short' }) },
          { text: adjudications[0].offenceDescription },
          { text: sentenceCase(adjudications[0].finding) },
        ],
        [
          { text: DateFormats.isoDateToUIDate(adjudications[1].reportedAt, { format: 'short' }) },
          { text: adjudications[1].offenceDescription },
          { text: sentenceCase(adjudications[1].finding) },
        ],
      ])
    })

    it('should render the card list for the prison tab', () => {
      const adjudications: Array<Adjudication> = adjudicationFactory.buildList(2)
      const csraSummaries = csraSummaryFactory.buildList(2)
      const fullPerson = fullPersonFactory.build()

      jest.spyOn(sentenceFns, 'adjudicationRows').mockReturnValue([])
      jest.spyOn(sentenceFns, 'csraRows').mockReturnValue([])

      const result = sentenceFns.prisonCards({
        adjudications,
        csraSummaries,
        person: fullPerson,
        adjudicationResult: 'success',
        csraResult: 'success',
        personResult: 'success',
      })

      expect(result).toEqual([
        {
          card: { title: { text: 'Prison details' } },
          rows: [{ key: { text: 'Prison name' }, value: { text: fullPerson.prisonName } }],
        },
        {
          card: { title: { text: 'Cell Sharing Risk Assessment (CSRA)' } },
          table: {
            head: [
              { text: 'Date assessed', classes: 'govuk-table__header--nowrap' },
              { text: 'Classification' },
              { text: 'Comment' },
            ],
            rows: [],
          },
        },
        {
          card: { title: { text: 'Adjudications' } },
          table: {
            head: [{ text: 'Date created' }, { text: 'Description' }, { text: 'Outcome' }],
            rows: [],
          },
        },
      ])
      expect(sentenceFns.adjudicationRows).toHaveBeenCalledWith(adjudications)
    })
  })
})

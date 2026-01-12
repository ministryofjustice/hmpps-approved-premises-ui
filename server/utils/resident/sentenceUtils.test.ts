import { render } from 'nunjucks'
import { Adjudication, Cas1OASysGroup, CsraSummary } from '@approved-premises/api'
import { ResidentProfileSubTab } from './index'
import {
  licenseCards,
  offenceCards,
  sentenceSideNavigation,
  sentenceSummaryList,
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
  licenceFactory,
  csraSummaryFactory,
} from '../../testutils/factories'
import { DateFormats } from '../dateUtils'
import { sentenceCase } from '../utils'
import {
  additionalConditionFactory,
  bespokeConditionFactory,
  standardConditionFactory,
} from '../../testutils/factories/licenceConditions'
import { fullPersonFactory } from '../../testutils/factories/person'

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

  const oasysUpdateDate = DateFormats.isoDateToUIDate(oasysAnswers.assessmentMetadata.dateCompleted)

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
          text: 'Offence and sentence',
        },
        {
          active: false,
          href: `${basePath}licence`,
          text: 'Licence',
        },
        {
          active: false,
          href: `${basePath}orders`,
          text: 'Orders',
        },
        {
          active: false,
          href: `${basePath}parole`,
          text: 'Parole',
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
      expect(offenceCards(offences)).toEqual([
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
      expect(offenceCards([offence])[0].rows).toEqual(
        expect.arrayContaining([
          { key: { text: 'Offence type' }, value: { text: offence.mainCategoryDescription } },
          { key: { text: 'Sub-category' }, value: { text: '' } },
        ]),
      )
    })

    it(`should show an empty additional offences card`, async () => {
      const offence = activeOffenceFactory.build({ mainOffence: true })
      offence.subCategoryDescription = offence.mainCategoryDescription
      expect(offenceCards([offence])[1].html).toEqual('No additional offences')
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
          card: { title: { text: 'Offence analysis' } },
          rows: [
            {
              key: {
                html: `Offence analysis
<p class="govuk-body-s">Imported from OASys 2.1</p>
<p class="govuk-body-s">Last updated on ${oasysUpdateDate}<p>`,
              },
              value: { html: 'rendered-output' },
            },
          ],
        },
        {
          card: { title: { text: 'Previous behaviours' } },
          rows: [
            {
              key: {
                html: `Previous behaviours
<p class="govuk-body-s">Imported from OASys 2.12</p>
<p class="govuk-body-s">Last updated on ${oasysUpdateDate}<p>`,
              },
              value: { html: 'rendered-output' },
            },
          ],
        },
      ])
      expect(render).toHaveBeenCalledWith('partials/detailsBlock.njk', {
        summaryText: oasysAnswers.answers[0].label,
        text: oasysAnswers.answers[0].answer,
      })
      expect(render).toHaveBeenCalledWith('partials/detailsBlock.njk', {
        summaryText: oasysAnswers.answers[1].label,
        text: oasysAnswers.answers[1].answer,
      })
    })

    it.each([
      ['there is no assessment', cas1OasysGroupFactory.noAssessment().build()],
      ['the assessment is undefined', undefined],
    ])('should render if %s', ([_, oasysGroup]) => {
      const result = offencesTabCards(offences, oasysGroup as unknown as Cas1OASysGroup)
      expect(result[2].rows[0].key).toEqual({
        html: `Offence analysis
<p class="govuk-body-s">OASys question 2.1 not available</p>`,
      })
      expect(result[3].rows[0].key).toEqual({
        html: `Previous behaviours
<p class="govuk-body-s">OASys question 2.12 not available</p>`,
      })
    })
  })

  describe('sentenceSummaryList', () => {
    it('should render the sentence summary list', () => {
      expect(sentenceSummaryList()).toEqual([
        { key: { text: 'Sentence type' }, value: { text: 'TBA' } },
        { key: { text: 'Sentence length' }, value: { text: 'TBA' } },
        { key: { text: 'Sentence start date' }, value: { text: 'TBA' } },
        { key: { text: 'Sentence end date' }, value: { text: 'TBA' } },
        { key: { text: 'NDelius Event number' }, value: { text: 'TBA' } },
      ])
    })
  })

  describe('csraRows', () => {
    const expectedSummary = (summary: CsraSummary) => [
      { text: DateFormats.isoDateToUIDate(summary.assessmentDate, { format: 'short' }) },
      { text: summary.assessmentCode },
      { text: summary.classificationCode },
      { text: summary.cellSharingAlertFlag ? 'True' : '' },
      { text: summary.assessmentComment },
    ]

    const csraSummaries = csraSummaryFactory.buildList(2)

    expect(csraRows(csraSummaries)).toEqual(csraSummaries.map(expectedSummary))
  })

  describe('offencesTabCards', () => {
    it('should render the offence cards', () => {
      jest.spyOn(sentenceFns, 'offenceCards').mockReturnValue([])
      jest.spyOn(sentenceFns, 'sentenceSummaryList').mockReturnValue([])
      jest.spyOn(sentenceFns, 'oasysOffenceCards').mockReturnValue([])

      expect(offencesTabCards(offences, oasysAnswers)).toEqual([
        { card: { title: { text: 'Sentence information' } }, rows: [] },
      ])
      expect(sentenceFns.offenceCards).toHaveBeenCalledWith(offences)
      expect(sentenceFns.oasysOffenceCards).toHaveBeenCalledWith(oasysAnswers)
    })
  })

  describe('sentenceSideNavigation', () => {
    it('should render the side navigation', () => {
      const baseUrl = '/manage/resident/crn/placement/placementId/sentence/'
      expect(sentenceSideNavigation('licence', 'crn', 'placementId')).toEqual([
        { active: false, href: `${baseUrl}offence`, text: 'Offence and sentence' },
        { active: true, href: `${baseUrl}licence`, text: 'Licence' },
        { active: false, href: `${baseUrl}orders`, text: 'Orders' },
        { active: false, href: `${baseUrl}parole`, text: 'Parole' },
        { active: false, href: `${baseUrl}prison`, text: 'Prison' },
      ])
    })
  })

  describe('licenceCards', () => {
    it('should render the licence cards', () => {
      const standardCondition = standardConditionFactory.build()
      const bespokeCondition = bespokeConditionFactory.build()
      const additionalCondition = additionalConditionFactory.build()
      const licence = licenceFactory.build({
        conditions: {
          AP: { standard: [standardCondition], bespoke: [bespokeCondition], additional: [additionalCondition] },
          PSS: { standard: [], additional: [] },
        },
      })
      expect(licenseCards(licence)).toEqual([
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
            { key: { text: 'Licence type' }, value: { text: licence.licenceType } },
            { key: { text: 'Licence kind' }, value: { text: licence.kind } },
            { key: { text: 'Status' }, value: { text: licence.statusCode } },
          ],
        },
        {
          card: { title: { text: 'Standard licence conditions (1)' } },
          rows: [
            {
              key: { text: standardCondition.code },
              value: { text: standardCondition.text },
            },
          ],
        },
        {
          card: { title: { text: 'Additional licence conditions (1)' } },
          rows: [
            {
              key: { text: additionalCondition.category },
              value: { text: additionalCondition.text },
            },
          ],
        },
        {
          card: { title: { text: 'Bespoke licence conditions (1)' } },
          rows: [
            {
              key: { text: 'Bespoke licence condition 1' },
              value: { text: bespokeCondition.text },
            },
          ],
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

      const result = sentenceFns.prisonCards(adjudications, csraSummaries, fullPerson)

      expect(result).toEqual([
        {
          card: { title: { text: 'Prison details' } },
          rows: [{ key: { text: 'Prison name' }, value: { text: fullPerson.prisonName } }],
        },
        {
          card: { title: { text: 'Cell Sharing Risk Assessment (CSRA)' } },
          table: {
            head: [
              { text: 'Date assessed' },
              { text: 'Assessment code' },
              { text: 'Classification' },
              { text: 'Alert flag' },
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

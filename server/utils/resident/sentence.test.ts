import { render } from 'nunjucks'
import { Cas1OASysGroup } from '@approved-premises/api'
import { createMock } from '@golevelup/ts-jest'
import { ResidentProfileSubTab } from './index'
import {
  licenseCards,
  offencesCards,
  offenceSummaryList,
  sentenceSideNavigation,
  sentenceSummaryList,
} from './sentence'
import * as sentenceFns from './sentence'
import { activeOffenceFactory, cas1OasysGroupFactory, cas1SpaceBookingFactory } from '../../testutils/factories'
import { bulletList } from '../formUtils'
import { DateFormats } from '../dateUtils'
import { PersonService } from '../../services'

const personService = createMock<PersonService>({})

jest.mock('nunjucks')

const crn = 'S123456'
const token = 'token'

describe('sentence', () => {
  const offences = activeOffenceFactory.buildList(2)
  const oasysAnswers = cas1OasysGroupFactory.offenceDetails().build()
  oasysAnswers.answers[0].questionNumber = '2.1'
  oasysAnswers.answers[1].questionNumber = '2.12'

  const indexOffence = offences[0]
  const oasysUpdateDate = DateFormats.isoDateToUIDate(oasysAnswers.assessmentMetadata.dateCompleted)

  beforeEach(() => {
    jest.resetAllMocks()
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

  describe('offenceSummaryList', () => {
    it('should render the offence summary list', () => {
      expect(offenceSummaryList(offences, oasysAnswers)).toEqual([
        { key: { text: 'Offence type' }, value: { text: indexOffence.offenceDescription } },
        { key: { text: 'Sub-category' }, value: { text: 'TBA' } },
        {
          key: {
            html: `Offence analysis
<p class="govuk-body-s">Imported from OASys 2.1</p>
<p class="govuk-body-s">Last updated on ${oasysUpdateDate}<p>`,
          },
          value: { html: 'rendered-output' },
        },
        { key: { text: 'Offence ID' }, value: { text: indexOffence.offenceId } },
        { key: { text: 'NDelius Event number' }, value: { text: indexOffence.deliusEventNumber } },
        {
          key: { text: 'Additional offences' },
          value: {
            html: bulletList(offences.map(({ offenceDescription: description }) => description)),
          },
        },
        {
          key: {
            html: `Previous behaviours
<p class="govuk-body-s">Imported from OASys 2.12</p>
<p class="govuk-body-s">Last updated on ${oasysUpdateDate}<p>`,
          },
          value: { html: 'rendered-output' },
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
      expect(offenceSummaryList(offences, oasysGroup as unknown as Cas1OASysGroup)).toEqual(
        expect.arrayContaining([
          {
            key: {
              html: `Offence analysis
<p class="govuk-body-s">OASys question 2.1 not available</p>`,
            },
            value: { text: '' },
          },
          {
            key: {
              html: `Previous behaviours
<p class="govuk-body-s">OASys question 2.12 not available</p>`,
            },
            value: { text: '' },
          },
        ]),
      )
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

  describe('offencesCards', () => {
    it('should render the offence cards', () => {
      jest.spyOn(sentenceFns, 'offenceSummaryList').mockReturnValue([])
      jest.spyOn(sentenceFns, 'sentenceSummaryList').mockReturnValue([])

      expect(offencesCards(offences, oasysAnswers)).toEqual([
        { card: { title: { text: 'Offence' } }, rows: [] },
        { card: { title: { text: 'Sentence information' } }, rows: [] },
      ])
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
      expect(licenseCards()).toEqual([
        {
          card: { title: { text: 'Licence conditions' } },
          rows: [
            { key: { text: 'Licence start date' }, value: { text: 'TBA' } },
            { key: { text: 'Licence end date' }, value: { text: 'TBA' } },
            { key: { text: 'Additional conditions' }, value: { text: 'TBA' } },
            { key: { text: 'Licence documents' }, value: { text: 'TBA' } },
          ],
        },
        {
          card: { title: { text: 'Licence conditions' } },
          rows: [
            { key: { text: 'EM licence conditions' }, value: { text: 'TBA' } },
            { key: { text: 'Drug and alcohol monitoring' }, value: { text: 'TBA' } },
            { key: { text: 'Exclusion zones' }, value: { text: 'TBA' } },
          ],
        },
      ])
    })
  })

  describe('sentenceOffencesTabController', () => {
    it('should render the sentenceOffencesTab card list', async () => {
      const offenceDetails = cas1OasysGroupFactory.offenceDetails().build()
      personService.getOasysAnswers.mockResolvedValue(offenceDetails)
      personService.getOffences.mockResolvedValue(offences)

      expect(await sentenceFns.sentenceOffencesTabController({ personService, token, crn })).toEqual({
        subHeading: 'Offence and sentence',
        cardList: offencesCards(offences, offenceDetails),
      })

      expect(personService.getOffences).toHaveBeenCalledWith(token, crn)
      expect(personService.getOasysAnswers).toHaveBeenCalledWith(token, crn, 'offenceDetails')
    })
  })

  describe('sentenceLicenceTabController', () => {
    it('should render the sentenceLicenceTab card list', async () => {
      expect(await sentenceFns.sentenceLicenceTabController()).toEqual({
        subHeading: 'Licence',
        cardList: licenseCards(),
      })
    })
  })
})

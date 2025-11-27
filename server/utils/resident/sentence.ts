import { ActiveOffence, Cas1OASysGroup } from '@approved-premises/api'
import { SummaryListItem, SummaryListWithCard } from '@approved-premises/ui'
import nunjucks from 'nunjucks'
import { bulletList, summaryListItem } from '../formUtils'
import paths from '../../paths/manage'
import { DateFormats } from '../dateUtils'
import { ResidentProfileSubTab } from './index'

const card = (title: string, rows: Array<SummaryListItem>) => ({
  card: {
    title: { text: title },
  },
  rows,
})

export const detailsBody = (summaryText: string, text: string) => {
  return nunjucks.render(`partials/detailsBlock.njk`, { summaryText, text })
}

export const offenceSummaryList = (
  offences: Array<ActiveOffence>,
  oasysAnswers: Cas1OASysGroup,
): Array<SummaryListItem> => {
  const { offenceDescription, offenceId, deliusEventNumber } = offences[0]
  const offenceAnalysis = oasysAnswers.answers.find(({ questionNumber }) => questionNumber === '2.1')
  const patternOfOffending = oasysAnswers.answers.find(({ questionNumber }) => questionNumber === '2.12')
  return [
    summaryListItem('Offence type', offenceDescription),
    summaryListItem('Sub-category', 'TBA'),
    {
      key: {
        html:
          'Offence analysis' +
          '<p class="govuk-body-s">Imported from OASys R6.1</p>' +
          `<p class="govuk-body-s">Last updated on ${DateFormats.isoDateToUIDate(oasysAnswers.assessmentMetadata.dateCompleted)}<p>`,
      },
      value: {
        html: offenceAnalysis ? detailsBody(offenceAnalysis.label, `${offenceAnalysis.answer}`) : '',
      },
    },
    summaryListItem('Offence ID', offenceId),
    summaryListItem('NDelius Event number', deliusEventNumber),
    summaryListItem(
      'Additional offences',
      bulletList(offences.map(({ offenceDescription: description }) => description)),
      'html',
    ),
    {
      key: {
        html:
          'Previous behaviours' +
          '<p class="govuk-body-s">Imported from OASys R6.1</p>' +
          `<p class="govuk-body-s">Last updated on ${DateFormats.isoDateToUIDate(oasysAnswers.assessmentMetadata.dateCompleted)}<p>`,
      },
      value: {
        html: patternOfOffending ? detailsBody(patternOfOffending.label, `${patternOfOffending.answer}`) : '',
      },
    },
    // TODO: We can't get a delius link yet - and the format of this needs tweaking
    // {
    //   key: { html: `<a href="${paths.premises.index({})}">View previous offences on Delius'</a>` },
    //   value: { text: '' },
    //   actions: { items: [{ text: 'View previous offences on Delius', href: paths.premises.index({}) }] },
    // },
  ].filter(Boolean)
}

export const sentenceSummaryList = () => {
  return [
    summaryListItem('Sentence type', 'TBA'),
    summaryListItem('Sentence length', 'TBA'),
    summaryListItem('Sentence start date', 'TBA'),
    summaryListItem('Sentence end date', 'TBA'),
    summaryListItem('NDelius Event number', 'TBA'),
  ]
}

export const sentenceSideNavigation = (subTab: ResidentProfileSubTab, crn: string, placementId: string) => {
  const basePath = paths.resident.tabSentence
  return [
    {
      text: 'Offence and sentence',
      href: paths.resident.tabSentence.offence({ crn, placementId }),
      active: subTab === 'offence',
    },
    { text: 'Licence', href: basePath.licence({ crn, placementId }), active: subTab === 'licence' },
    { text: 'Orders', href: basePath.orders({ crn, placementId }), active: subTab === 'orders' },
    { text: 'Parole', href: basePath.parole({ crn, placementId }), active: subTab === 'parole' },
    { text: 'Prison', href: basePath.prison({ crn, placementId }), active: subTab === 'prison' },
  ]
}

export const offencesCards = (
  offences: Array<ActiveOffence>,
  oasysAnswers: Cas1OASysGroup,
): Array<SummaryListWithCard> => [
  {
    card: {
      title: { text: 'Offence' },
    },
    rows: offenceSummaryList(offences, oasysAnswers),
  },
  {
    card: {
      title: { text: 'Sentence information' },
    },
    rows: sentenceSummaryList(),
  },
]

export const licenseCards = (): Array<SummaryListWithCard> => [
  card('Licence conditions', [
    summaryListItem('Licence start date', 'TBA'),
    summaryListItem('Licence end date', 'TBA'),
    summaryListItem('Additional conditions', 'TBA'),
    summaryListItem('Licence documents', 'TBA'),
  ]),
  card('Licence conditions', [
    summaryListItem('EM licence conditions', 'TBA'),
    summaryListItem('Drug and alcohol monitoring', 'TBA'),
    summaryListItem('Exclusion zones', 'TBA'),
  ]),
]

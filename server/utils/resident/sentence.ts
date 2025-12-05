import { ActiveOffence, Cas1OASysGroup } from '@approved-premises/api'
import { SummaryListItem, SummaryListWithCard } from '@approved-premises/ui'
import { bulletList, summaryListItem } from '../formUtils'
import paths from '../../paths/manage'
import { DateFormats } from '../dateUtils'
import { card, detailsBody, ResidentProfileSubTab } from './index'

const oasysAnswer = (oasysAnswers: Cas1OASysGroup, questionNumber: string, questionName: string): SummaryListItem => {
  if (oasysAnswers?.assessmentMetadata?.hasApplicableAssessment) {
    const question = oasysAnswers.answers.find(({ questionNumber: qn }) => questionNumber === qn)
    return {
      key: {
        html: `${questionName}
<p class="govuk-body-s">Imported from OASys ${questionNumber}</p>
<p class="govuk-body-s">Last updated on ${DateFormats.isoDateToUIDate(oasysAnswers.assessmentMetadata.dateCompleted)}<p>`,
      },
      value: {
        html: question ? detailsBody(question.label, `${question.answer}`) : '',
      },
    }
  }
  return {
    key: {
      html: `${questionName}
<p class="govuk-body-s">OASys question ${questionNumber} not available</p>`,
    },
    value: { text: '' },
  }
}

export const offenceSummaryList = (
  offences: Array<ActiveOffence>,
  oasysAnswers: Cas1OASysGroup,
): Array<SummaryListItem> => {
  const { offenceDescription, offenceId, deliusEventNumber } = offences && offences[0]
  return [
    summaryListItem('Offence type', offenceDescription),
    summaryListItem('Sub-category', 'TBA'),
    oasysAnswer(oasysAnswers, '2.1', 'Offence analysis'),
    summaryListItem('Offence ID', offenceId),
    summaryListItem('NDelius Event number', deliusEventNumber),
    summaryListItem(
      'Additional offences',
      bulletList(offences.map(({ offenceDescription: description }) => description)),
      'html',
    ),
    oasysAnswer(oasysAnswers, '2.12', 'Previous behaviours'),
    // TODO: Add Delius link in here
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
      href: basePath.offence({ crn, placementId }),
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

import { ActiveOffence, Adjudication, Cas1OASysGroup } from '@approved-premises/api'
import { SummaryListItem, SummaryListWithCard, TableRow } from '@approved-premises/ui'
import { summaryListItem } from '../formUtils'
import paths from '../../paths/manage'
import { DateFormats } from '../dateUtils'
import { card, detailsBody, ResidentProfileSubTab, TabControllerParameters, TabData } from './index'
import { sentenceCase } from '../utils'
import { dateCell, textCell } from '../tableUtils'

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

const getOffenceDescriptions = (
  offence: ActiveOffence,
): { mainCategoryDescription: string; subCategoryDescription: string } => {
  const { mainCategoryDescription, subCategoryDescription: sub } = offence || {}
  return { mainCategoryDescription, subCategoryDescription: mainCategoryDescription === sub ? '' : sub }
}

export const offenceCards = (offences: Array<ActiveOffence>): Array<SummaryListWithCard> => {
  const mainOffence: ActiveOffence = offences.find(({ mainOffence: isMain }) => isMain) || offences[0]

  const { offenceId, deliusEventNumber, offenceDate } = mainOffence
  const { mainCategoryDescription, subCategoryDescription } = getOffenceDescriptions(mainOffence)
  return [
    card({
      title: 'Offence',
      rows: [
        summaryListItem('Offence type', mainCategoryDescription),
        summaryListItem('Sub-category', subCategoryDescription),
        summaryListItem('Date of offence', offenceDate, 'date'),
        summaryListItem('Offence ID', offenceId),
        summaryListItem('NDelius Event number', deliusEventNumber),
      ],
    }),
    card({
      title: 'Additional offences',
      table:
        offences.length > 1
          ? {
              head: [textCell('Main category'), textCell('Sub-category'), textCell('Date of offence')],
              rows: additionalOffencesRows(offences, mainOffence),
            }
          : undefined,
      html: offences.length <= 1 ? 'No additional offences' : undefined,
    }),
  ]
}

export const additionalOffencesRows = (offences: Array<ActiveOffence>, mainOffence: ActiveOffence): Array<TableRow> =>
  offences
    .map((offence: ActiveOffence) => {
      const { mainCategoryDescription, subCategoryDescription } = getOffenceDescriptions(offence)
      return (
        offence !== mainOffence && [
          textCell(mainCategoryDescription),
          textCell(subCategoryDescription),
          dateCell(offence.offenceDate),
        ]
      )
    })
    .filter(Boolean)

export const oasysOffenceCards = (oasysAnswers: Cas1OASysGroup): Array<SummaryListWithCard> => [
  card({ title: 'Offence analysis', rows: [oasysAnswer(oasysAnswers, '2.1', 'Offence analysis')] }),
  card({ title: 'Previous behaviours', rows: [oasysAnswer(oasysAnswers, '2.12', 'Previous behaviours')] }),
]

export const sentenceSummaryList = () => {
  return [
    summaryListItem('Sentence type', 'TBA'),
    summaryListItem('Sentence length', 'TBA'),
    summaryListItem('Sentence start date', 'TBA'),
    summaryListItem('Sentence end date', 'TBA'),
    summaryListItem('NDelius Event number', 'TBA'),
  ]
}

export const offencesTabCards = (
  offences: Array<ActiveOffence>,
  oasysAnswers: Cas1OASysGroup,
): Array<SummaryListWithCard> => [
  ...offenceCards(offences),
  ...oasysOffenceCards(oasysAnswers),
  card({ title: 'Sentence information', rows: sentenceSummaryList() }),
]

export const licenseCards = (): Array<SummaryListWithCard> => [
  card({
    title: 'Licence conditions',
    rows: [
      summaryListItem('Licence start date', 'TBA'),
      summaryListItem('Licence end date', 'TBA'),
      summaryListItem('Additional conditions', 'TBA'),
      summaryListItem('Licence documents', 'TBA'),
    ],
  }),
  card({
    title: 'Licence conditions',
    rows: [
      summaryListItem('EM licence conditions', 'TBA'),
      summaryListItem('Drug and alcohol monitoring', 'TBA'),
      summaryListItem('Exclusion zones', 'TBA'),
    ],
  }),
]

export const adjudicationRows = (adjudications: Array<Adjudication>): Array<TableRow> => {
  return adjudications.map(adjudication => {
    return [
      { text: DateFormats.isoDateToUIDate(adjudication.reportedAt) },
      { text: adjudication.offenceDescription },
      { text: sentenceCase(adjudication.finding) },
      { text: 'TBA' },
    ]
  })
}

export const prisonCards = (adjudications: Array<Adjudication>): Array<SummaryListWithCard> => [
  card({
    title: 'Prison details',
    rows: [summaryListItem('Prison name', 'TBA')],
  }),
  card({
    title: 'Cell Sharing Risk Assessment (CRSA)',
    rows: [summaryListItem('Type', 'TBA')],
  }),
  card({
    title: 'Adjudications',
    table: {
      head: [{ text: 'Date created' }, { text: 'Description' }, { text: 'Outcome' }, { text: 'Sanction' }],
      rows: adjudicationRows(adjudications),
    },
  }),
]

export const sentenceOffencesTabController = async ({
  personService,
  token,
  crn,
}: TabControllerParameters): Promise<TabData> => {
  const [offences, offenceAnswers]: [Array<ActiveOffence>, Cas1OASysGroup] = await Promise.all([
    personService.getOffences(token, crn),
    personService.getOasysAnswers(token, crn, 'offenceDetails'),
  ])

  return { subHeading: 'Offence and sentence', cardList: offencesTabCards(offences, offenceAnswers) }
}

export const sentenceLicenceTabController = async () => {
  return { subHeading: 'Licence', cardList: licenseCards() }
}

export const sentencePrisonTabController = async ({
  personService,
  token,
  crn,
}: TabControllerParameters): Promise<TabData> => {
  const [adjudications]: [Array<Adjudication>] = await Promise.all([personService.getAdjudications(token, crn)])
  return { subHeading: 'Prison', cardList: prisonCards(adjudications) }
}

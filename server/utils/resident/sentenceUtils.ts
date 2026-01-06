import {
  ActiveOffence,
  Adjudication,
  Cas1OASysGroup,
  Licence,
  CsraSummary,
  Person,
  FullPerson,
} from '@approved-premises/api'
import { SummaryListItem, SummaryListWithCard, TableRow } from '@approved-premises/ui'
import { summaryListItem } from '../formUtils'
import paths from '../../paths/manage'
import { DateFormats } from '../dateUtils'
import { card, detailsBody, insetText, ResidentProfileSubTab } from './index'
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
  if (!offences?.length) return [card({ html: insetText('No offences found') })]

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

export const licenseCards = (licence: Licence): Array<SummaryListWithCard> => {
  if (!licence) return [card({ html: insetText('No licence available') })]

  const { standard: pssStandard, additional: pssAdditional } = licence.conditions?.PSS || {}

  const { bespoke, standard, additional } = licence.conditions?.AP || {}

  const allStandard = [...(pssStandard || []), ...(standard || [])]
  const allAdditional = [...(pssAdditional || []), ...(additional || [])]

  return [
    card({ html: insetText('Imported from Create and vary a licence service.') }),
    card({
      title: 'Licence overview',
      rows: [
        summaryListItem('Licence start date', licence.licenceStartDate, 'date'),
        summaryListItem('Licence approved date', licence.approvedDateTime, 'date'),
        summaryListItem('Last updated', licence.updatedDateTime, 'date'),
        summaryListItem('Licence type', licence.licenceType),
        summaryListItem('Licence kind', licence.kind),
        summaryListItem('Status', licence.statusCode),
      ],
    }),
    allStandard?.length &&
      card({
        title: `Standard licence conditions (${allStandard.length})`,
        rows: allStandard.map(({ code, text }) => summaryListItem(code, text)),
      }),
    allAdditional?.length &&
      card({
        title: `Additional licence conditions (${allAdditional.length})`,
        rows: allAdditional.map(({ text, category }) => summaryListItem(category, text)),
      }),
    bespoke?.length &&
      card({
        title: `Bespoke licence conditions (${bespoke.length})`,
        rows: bespoke.map(({ text }, index) => summaryListItem(`Bespoke licence condition ${index + 1}`, text)),
      }),
  ].filter(Boolean)
}

export const csraRows = (csraSummaries: Array<CsraSummary>): Array<TableRow> => {
  return csraSummaries.map(csra => {
    return [
      DateFormats.isoDateToUIDate(csra.assessmentDate, { format: 'short' }),
      csra.assessmentCode,
      csra.classificationCode,
      csra.cellSharingAlertFlag ? 'True' : '',
      csra.assessmentComment,
    ].map(textCell)
  })
}

export const adjudicationRows = (adjudications: Array<Adjudication>): Array<TableRow> => {
  return adjudications.map(adjudication => {
    return [
      DateFormats.isoDateToUIDate(adjudication.reportedAt, { format: 'short' }),
      adjudication.offenceDescription,
      sentenceCase(adjudication.finding),
    ].map(textCell)
  })
}

export const prisonCards = (
  adjudications: Array<Adjudication>,
  csraSumaries: Array<CsraSummary>,
  person: Person,
): Array<SummaryListWithCard> => [
  card({
    title: 'Prison details',
    rows: [
      summaryListItem(
        'Prison name',
        person?.type === 'FullPerson' ? ((person as FullPerson).prisonName ?? '').trim() : 'Not available',
      ),
    ],
  }),
  card({
    title: 'Cell Sharing Risk Assessment (CSRA)',
    table: csraSumaries?.length
      ? {
          head: ['Date assessed', 'Assessment code', 'Classification', 'Alert flag', 'Comment'].map(textCell),
          rows: csraRows(csraSumaries),
        }
      : undefined,
    html: csraSumaries?.length ? undefined : 'No assessments found',
  }),
  card(
    adjudications
      ? {
          title: 'Adjudications',
          table: {
            head: ['Date created', 'Description', 'Outcome'].map(textCell),
            rows: adjudicationRows(adjudications),
          },
        }
      : { html: insetText('No adjudications found') },
  ),
]

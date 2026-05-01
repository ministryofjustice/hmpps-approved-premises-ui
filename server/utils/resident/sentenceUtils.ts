import {
  ActiveOffence,
  Adjudication,
  Cas1OASysGroup,
  Licence,
  CsraSummary,
  Person,
  FullPerson,
  ApConditions,
  AdditionalCondition,
  StandardCondition,
  BespokeCondition,
  PrisonCaseNote,
  CaseDetail,
  Offence,
} from '@approved-premises/api'
import { subYears } from 'date-fns'
import { SummaryListWithCard, Table, TableRow } from '@approved-premises/ui'
import { bulletList, summaryListItem } from '../formUtils'
import paths from '../../paths/manage'
import { DateFormats } from '../dateUtils'
import {
  card,
  combineResultAndContent,
  CsraClassification,
  csraClassificationMapping,
  insetText,
  loadingErrorMessage,
  ResidentProfileSubTab,
} from './index'

import { ApiOutcome, objectClean, sentenceCase } from '../utils'
import { dateCell, htmlCell, textCell } from '../tableUtils'
import { summaryCards } from './riskUtils'
import { embeddedSummaryListItem } from '../applications/summaryListUtils/embeddedSummaryListItem'

export const sentenceSideNavigation = (subTab: ResidentProfileSubTab, crn: string, placementId: string) => {
  const basePath = paths.resident.tabSentence
  return [
    { text: 'Offence and sentence', href: basePath.offence({ crn, placementId }), active: subTab === 'offence' },
    { text: 'Licence', href: basePath.licence({ crn, placementId }), active: subTab === 'licence' },
    { text: 'Prison', href: basePath.prison({ crn, placementId }), active: subTab === 'prison' },
  ]
}

const getOffenceDescriptions = (
  offence: ActiveOffence | Offence,
): { mainCategoryDescription: string; subCategoryDescription: string } => {
  const { mainCategoryDescription, subCategoryDescription: sub } = offence || {}
  return { mainCategoryDescription, subCategoryDescription: mainCategoryDescription === sub ? '' : sub }
}

export const offenceCards = (caseDetail: CaseDetail, caseDetailOutcome: ApiOutcome): Array<SummaryListWithCard> => {
  const title = 'Offence details'

  const fullOutcome = caseDetailOutcome === 'success' && !caseDetail?.offences?.length ? 'notFound' : caseDetailOutcome

  const errorMessage = loadingErrorMessage(fullOutcome, 'offence', 'nDelius')
  if (errorMessage) return [card({ title, html: errorMessage })]

  const { offences } = caseDetail
  const mainOffence: Offence = offences.find(({ main: isMain }) => isMain) || offences[0]

  const { id, eventNumber, date } = mainOffence
  const { mainCategoryDescription, subCategoryDescription } = getOffenceDescriptions(mainOffence)
  return [
    card({
      title,
      rows: [
        summaryListItem('Offence type', mainCategoryDescription),
        summaryListItem('Sub-category', subCategoryDescription),
        summaryListItem('Date of offence', date, 'date'),
        summaryListItem('Offence ID', id),
        summaryListItem('NDelius Event number', eventNumber),
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

export const additionalOffencesRows = (offences: Array<Offence>, mainOffence: Offence): Array<TableRow> =>
  offences
    .sort((a, b) => (a.date > b.date ? -1 : 1))
    .map(offence => {
      const { mainCategoryDescription, subCategoryDescription } = getOffenceDescriptions(offence)
      return (
        offence !== mainOffence && [
          textCell(mainCategoryDescription),
          textCell(subCategoryDescription),
          offence.date ? dateCell(offence.date) : textCell(''),
        ]
      )
    })
    .filter(Boolean)

export const sentenceCards = (caseDetail: CaseDetail, caseDetailOutcome: ApiOutcome) => {
  const errorMessage = loadingErrorMessage(caseDetailOutcome, 'sentence', 'nDelius')
  const title = 'Sentence'
  return !errorMessage
    ? caseDetail.sentences.map(({ typeDescription, startDate, endDate, eventNumber }) =>
        card({
          title,
          rows: [
            summaryListItem('Sentence type', typeDescription),
            summaryListItem('Sentence length', DateFormats.formatDurationBetweenDates(startDate, endDate)),
            summaryListItem('Sentence start date', startDate, 'date'),
            summaryListItem('Sentence end date', endDate, 'date'),
            summaryListItem('NDelius event number', eventNumber),
          ],
        }),
      )
    : [card({ title, html: errorMessage })]
}

export const oasysOffenceCards = (oasysAnswers: Cas1OASysGroup, callResult: ApiOutcome): Array<SummaryListWithCard> => [
  ...summaryCards(['2.1', '2.12'], oasysAnswers, callResult),
]

export const offencesTabCards = ({
  caseDetail,
  caseDetailOutcome,
  oasysAnswers,
  oasysOutcome,
}: {
  caseDetail: CaseDetail
  oasysAnswers: Cas1OASysGroup
  oasysOutcome: ApiOutcome
  caseDetailOutcome: ApiOutcome
}): Array<SummaryListWithCard> => [
  ...offenceCards(caseDetail, caseDetailOutcome),
  ...oasysOffenceCards(oasysAnswers, oasysOutcome),
  ...sentenceCards(caseDetail, caseDetailOutcome),
]

export const licenseCards = (licence: Licence, licenceResult: ApiOutcome): Array<SummaryListWithCard> => {
  const errorMessage = loadingErrorMessage(licenceResult, 'licence', 'cvl')
  if (errorMessage) return [card({ title: 'Licence overview', html: errorMessage })]

  const coalesceAdditionalConditions = (conditions: Array<AdditionalCondition>) => {
    const groups = conditions.reduce(
      (out, { category, text }) => {
        out[category] = [...(out[category] || []), text]
        return out
      },
      {} as Record<string, Array<string>>,
    )
    return Object.entries(groups).map(([category, list]) => [
      textCell('Additional'),
      htmlCell(`<strong>${category}</strong><br>${list.length === 1 ? list[0] : bulletList(list)}`),
    ])
  }

  const cardTable = (conditions: ApConditions, conditionColumnName = 'Condition'): Table => {
    const { standard = [], additional = [], bespoke = [] } = conditions
    return {
      head: [textCell('Type'), textCell(conditionColumnName)],
      rows: [
        ...standard.map((condition: StandardCondition) => [textCell('Standard'), textCell(condition.text)]),
        ...coalesceAdditionalConditions(additional),
        ...bespoke.map((condition: BespokeCondition) => [textCell('Bespoke'), textCell(condition.text)]),
      ],
    }
  }

  const {
    conditions: { AP, PSS },
  } = licence

  return [
    card({ html: insetText('Imported from Create and vary a licence service.') }),
    card({
      title: 'Licence overview',
      rows: [
        summaryListItem('Licence start date', licence.licenceStartDate, 'date'),
        summaryListItem('Licence approved date', licence.approvedDateTime, 'date'),
        summaryListItem('Last updated', licence.updatedDateTime, 'date'),
      ],
    }),

    card({
      title: `Licence conditions`,
      table: cardTable(AP),
    }),
    (PSS?.standard?.length || PSS?.additional?.length) &&
      card({
        title: `Post-sentence supervision requirements`,
        table: cardTable(PSS as ApConditions, 'Requirement'),
      }),
  ].filter(Boolean)
}

export const csraRows = (csraSummaries: Array<CsraSummary>): Array<TableRow> => {
  const showCsraFromDate = DateFormats.dateObjToIsoDate(subYears(new Date(), 3))

  const sorted = csraSummaries.sort((s1, s2) => (s1.assessmentDate > s2.assessmentDate ? -1 : 1))
  const recent = sorted.filter(({ assessmentDate }) => assessmentDate > showCsraFromDate)

  const toShow = recent.length ? recent : sorted.slice(0, 1)
  return toShow.map(csra => {
    return [
      dateCell(csra.assessmentDate),
      textCell(csraClassificationMapping[csra.classificationCode as CsraClassification]),
      textCell(csra.assessmentComment),
    ]
  })
}

export const adjudicationRows = (adjudications: Array<Adjudication>): Array<TableRow> => {
  return adjudications.map(({ reportedAt, offenceDescription, finding }) => {
    return [dateCell(reportedAt), textCell(offenceDescription), textCell(sentenceCase(finding))]
  })
}

const sensitiveBadge = `<span class="moj-badge moj-badge--red govuk-tag--float-right">Sensitive</span>`

export const renderCaseNote = (caseNote: PrisonCaseNote) =>
  objectClean<Record<string, unknown>>({
    'Date occurred': `${DateFormats.isoDateToUIDate(caseNote.occurredAt)}${caseNote.sensitive ? sensitiveBadge : ''}`,
    'Date created':
      caseNote.createdAt && (caseNote.occurredAt || '').substring(0, 10) !== (caseNote.createdAt || '').substring(0, 10)
        ? DateFormats.isoDateToUIDate(caseNote.createdAt)
        : undefined,
    'Type / sub-type': `${caseNote.type} / ${caseNote.subType}`,
    Note: `<span class="govuk-body__text-block">${caseNote.note}</span>`,
  })

export const caseNoteBlock = (caseNotes: Array<PrisonCaseNote>): string =>
  caseNotes?.length ? embeddedSummaryListItem(caseNotes.map(renderCaseNote)) : 'No case notes found'

export const prisonCards = ({
  adjudications,
  adjudicationResult,
  csraSummaries,
  csraResult,
  person,
  personResult,
  caseNotes,
  caseNotesResult,
}: {
  adjudications: Array<Adjudication>
  adjudicationResult: ApiOutcome
  csraSummaries: Array<CsraSummary>
  csraResult: ApiOutcome
  person: Person
  personResult: ApiOutcome
  caseNotes: Array<PrisonCaseNote>
  caseNotesResult: ApiOutcome
}): Array<SummaryListWithCard> => {
  const adjudicationsError = loadingErrorMessage(adjudicationResult, 'adjudication', 'dps')
  const csraError = loadingErrorMessage(csraResult, 'CSRA', 'dps')
  const personError = loadingErrorMessage(personResult, 'person', 'nDelius')
  const filteredCaseNotes = (caseNotes || []).filter(({ type }) => type !== 'Alert')
  const caseNotesError = loadingErrorMessage(
    combineResultAndContent(caseNotesResult, filteredCaseNotes.length),
    'case notes',
    'dps',
  )

  return [
    card({
      title: 'Prison details',
      rows: !personError
        ? [summaryListItem('Prison name', ((person as FullPerson)?.prisonName ?? 'Not available').trim())]
        : undefined,
      html: personError,
    }),
    card({
      title: 'Cell Sharing Risk Assessment (CSRA)',
      table: !csraError
        ? {
            head: [
              { text: 'Date assessed', classes: 'govuk-table__header--nowrap' },
              textCell('Classification'),
              textCell('Comment'),
            ],
            rows: csraRows(csraSummaries || []),
          }
        : undefined,
      html: csraError,
    }),
    card({
      title: 'Adjudications',
      table: !adjudicationsError
        ? {
            head: ['Date created', 'Description', 'Outcome'].map(textCell),
            rows: adjudicationRows(adjudications),
          }
        : undefined,
      html: adjudicationsError,
    }),
    card({
      title: 'Prison case notes',
      html: !caseNotesError ? caseNoteBlock(filteredCaseNotes) : caseNotesError,
    }),
  ]
}

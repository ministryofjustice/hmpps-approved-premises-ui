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
  Cas1SpaceBooking,
} from '@approved-premises/api'
import { subYears } from 'date-fns'
import { SummaryListWithCard, Table, TableRow } from '@approved-premises/ui'
import { bulletList, summaryListItem } from '../formUtils'
import paths from '../../paths/manage'
import { DateFormats } from '../dateUtils'
import {
  card,
  CsraClassification,
  csraClassificationMapping,
  insetText,
  loadingErrorMessage,
  ndeliusDeeplink,
  ResidentProfileSubTab,
} from './index'

import { ApiOutcome, sentenceCase } from '../utils'
import { dateCell, htmlCell, textCell } from '../tableUtils'
import { summaryCards } from './riskUtils'

export const sentenceSideNavigation = (subTab: ResidentProfileSubTab, crn: string, placementId: string) => {
  const basePath = paths.resident.tabSentence
  return [
    { text: 'Offence and sentence', href: basePath.offence({ crn, placementId }), active: subTab === 'offence' },
    { text: 'Licence', href: basePath.licence({ crn, placementId }), active: subTab === 'licence' },
    { text: 'Prison', href: basePath.prison({ crn, placementId }), active: subTab === 'prison' },
  ]
}

const getOffenceDescriptions = (
  offence: ActiveOffence,
): { mainCategoryDescription: string; subCategoryDescription: string } => {
  const { mainCategoryDescription, subCategoryDescription: sub } = offence || {}
  return { mainCategoryDescription, subCategoryDescription: mainCategoryDescription === sub ? '' : sub }
}

export const offenceCards = (
  offences: Array<ActiveOffence>,
  offencesOutcome: ApiOutcome,
): Array<SummaryListWithCard> => {
  const title = 'Offence details'
  const fullOutcome = offencesOutcome === 'success' && !offences?.length ? 'notFound' : offencesOutcome

  const errorMessage = loadingErrorMessage({ result: fullOutcome, item: 'offence', source: 'NDelius' })
  if (errorMessage) return [card({ title, html: errorMessage })]

  const mainOffence: ActiveOffence = offences.find(({ mainOffence: isMain }) => isMain) || offences[0]

  const { offenceId, deliusEventNumber, offenceDate } = mainOffence
  const { mainCategoryDescription, subCategoryDescription } = getOffenceDescriptions(mainOffence)
  return [
    card({
      title,
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
          offence.offenceDate ? dateCell(offence.offenceDate) : textCell(''),
        ]
      )
    })
    .filter(Boolean)

export const sentenceCards = (placement: Cas1SpaceBooking) => {
  const link = ndeliusDeeplink({
    crn: placement.person.crn,
    text: 'View event list on NDelius (opens in a new tab)',
    component: 'EventsList',
  })
  return [
    card({
      html: insetText(
        `<p>We cannot display sentence details from NDelius yet.</p><p>You can view this information in the event details. The event number is ${placement.deliusEventNumber}</p>${link}`,
      ),
    }),
  ]
}

export const oasysOffenceCards = (oasysAnswers: Cas1OASysGroup, callResult: ApiOutcome): Array<SummaryListWithCard> => [
  ...summaryCards(['2.1', '2.12'], oasysAnswers, callResult),
]

export const offencesTabCards = ({
  offences,
  oasysAnswers,
  offencesOutcome,
  oasysOutcome,
}: {
  offences: Array<ActiveOffence>
  oasysAnswers: Cas1OASysGroup
  offencesOutcome: ApiOutcome
  oasysOutcome: ApiOutcome
}): Array<SummaryListWithCard> => [
  ...offenceCards(offences, offencesOutcome),
  ...oasysOffenceCards(oasysAnswers, oasysOutcome),
]

export const licenseCards = (licence: Licence, licenceResult: ApiOutcome): Array<SummaryListWithCard> => {
  const errorMessage = loadingErrorMessage({
    result: licenceResult,
    item: 'licence',
    source: 'Create and vary a licence',
  })
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
      DateFormats.isoDateToUIDate(csra.assessmentDate, { format: 'short' }),
      csraClassificationMapping[csra.classificationCode as CsraClassification],
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

export const prisonCards = ({
  adjudications,
  adjudicationResult,
  csraSummaries,
  csraResult,
  person,
  personResult,
}: {
  adjudications: Array<Adjudication>
  adjudicationResult: ApiOutcome
  csraSummaries: Array<CsraSummary>
  csraResult: ApiOutcome
  person: Person
  personResult: ApiOutcome
}): Array<SummaryListWithCard> => {
  const adjudicationsError = loadingErrorMessage({
    result: adjudicationResult,
    item: 'adjudication',
    source: 'Digital Prison Service',
  })

  const csraError = loadingErrorMessage({
    result: csraResult,
    item: 'CSRA',
    source: 'Digital Prison Service',
  })

  const personError = loadingErrorMessage({
    result: personResult,
    item: 'person',
    source: 'NDelius',
  })
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
  ]
}

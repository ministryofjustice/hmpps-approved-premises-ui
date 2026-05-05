import {
  Cas1OASysGroup,
  Cas1OASysGroupName,
  Cas1SpaceBooking,
  OASysQuestion,
  PersonRisks,
  Registration,
  RoshRisks,
} from '@approved-premises/api'
import { SummaryListWithCard, TableRow } from '@approved-premises/ui'
import nunjucks from 'nunjucks'
import {
  card,
  detailsBody,
  detailsBodyWithPreview,
  insetText,
  loadingErrorMessage,
  ndeliusDeeplink,
  ResidentProfileSubTab,
  subHeadingH2,
  subHeadingH3,
} from './index'
import paths from '../../paths/manage'
import { DateFormats } from '../dateUtils'
import { ApiOutcome, linkTo } from '../utils'
import { htmlCell, textCell } from '../tableUtils'
import config from '../../config'

export const riskSideNavigation = (subTab: ResidentProfileSubTab, crn: string, placementId: string) => {
  return [
    {
      text: 'Risk information',
      href: paths.resident.tabRisk.riskDetails({ crn, placementId }),
      active: subTab === 'riskDetails',
    },
  ]
}

export const tableRow = (content: string) =>
  `<table class="govuk-table text-table">
  <tbody class="govuk-table__body">
  <tr class="govuk-table__row">
  <td class="govuk-table__cell">
    ${content}
  </td>
  </tr>
  </tbody>
  </table>`

export const oasysMetadataRow = (qNumber: string, blockName: string, block: Cas1OASysGroup) => {
  const lastUpdated = block.assessmentMetadata?.dateCompleted
    ? `<p class="govuk-body-m govuk-hint">Last updated: ${DateFormats.isoDateToUIDate(block.assessmentMetadata.dateCompleted)}</p>`
    : ''
  return `${tableRow(`<p class="govuk-!-margin-bottom-2">${qNumber} ${blockName}</p>${lastUpdated}`)}`
}

type OasysGroupDefinition = Array<{ label: string; questionNumber: string }>

export const oasysGroupMapping: Record<Cas1OASysGroupName, string> = {
  roshSummary: 'ROSH summary',
  riskManagementPlan: 'OASys risk management plan',
  offenceDetails: 'OASys offence details',
  supportingInformation: 'OASys supporting information',
  riskToSelf: 'OASys risk to self',
}

export const oasysQuestionMappping: Record<Cas1OASysGroupName, OasysGroupDefinition> = {
  roshSummary: [
    { label: 'Who is at risk', questionNumber: 'R10.1' },
    { label: 'Nature of the risk', questionNumber: 'R10.2' },
    {
      label: 'Circumstances or situations where offending is most likely to occur',
      questionNumber: 'SUM11',
    },
    { label: 'Analysis of risk factors', questionNumber: 'SUM9' },
    { label: 'Strengths and protective factors', questionNumber: 'SUM10' },
  ],
  offenceDetails: [
    { label: 'Offence analysis', questionNumber: '2.1' },
    { label: 'Victim - perpetrator relationship', questionNumber: '2.4.1' },
    { label: 'Other victim information', questionNumber: '2.4.2' },
    { label: 'Impact on the victim', questionNumber: '2.5' },
    { label: 'Motivation and triggers', questionNumber: '2.8.3' },
    { label: 'Issues contributing to risks', questionNumber: '2.98' },
    { label: 'Pattern of offending', questionNumber: '2.12' },
  ],
  riskToSelf: [
    { label: 'Analysis of current or previous self-harm and/or suicide concerns', questionNumber: 'FA62' },
    { label: 'Coping in custody / approved premises / hostel / secure hospital', questionNumber: 'FA63' },
    { label: 'Analysis of vulnerabilities', questionNumber: 'FA64' },
    { label: 'Current concerns about self-harm or suicide', questionNumber: 'R8.1.1' },
    { label: 'Current concerns about Coping in Custody or Hostel', questionNumber: 'R8.2.1' },
    { label: 'Current concerns about Vulnerability', questionNumber: 'R8.3.1' },
  ],
  riskManagementPlan: [
    { label: 'Further considerations', questionNumber: 'RM28' },
    { label: 'Additional comments', questionNumber: 'RM35' },
    { label: 'Contingency plans', questionNumber: 'RM34' },
    { label: 'Victim safety planning', questionNumber: 'RM33' },
    { label: 'Interventions and treatment', questionNumber: 'RM32' },
    { label: 'Monitoring and control', questionNumber: 'RM31' },
    { label: 'Supervision', questionNumber: 'RM30' },
    { label: 'Key information about current situation', questionNumber: 'RM28.1' },
  ],
  supportingInformation: [
    { label: 'Accommodation issues contributing to risks of offending and harm', questionNumber: '3.9' },
    { label: 'Relationship issues contributing to risks of offending and harm', questionNumber: '6.9' },
    { label: 'Lifestyle issues contributing to risks of offending and harm', questionNumber: '7.9' },
    { label: 'Drug misuse issues contributing to risks of offending and harm', questionNumber: '8.9' },
    { label: 'Alcohol misuse issues contributing to risks of offending and harm', questionNumber: '9.9' },
    { label: 'Issues of emotional well-being contributing to risks of offending and harm', questionNumber: '10.9' },
    { label: 'Thinking / behavioural issues contributing to risks of offending and harm', questionNumber: '11.9' },
    { label: 'Issues about attitudes contributing to risks of offending and harm', questionNumber: '12.9' },
    { label: 'General Health - Any physical or mental health conditions', questionNumber: '13.1' },
  ],
}
export const oasysQuestionDetailsByNumber = (() => {
  const out = {} as Record<string, { label: string; groupName: Cas1OASysGroupName }>
  Object.entries(oasysQuestionMappping).forEach(([groupName, definitions]) => {
    definitions.forEach(({ label, questionNumber }) => {
      out[questionNumber] = { label, groupName: groupName as Cas1OASysGroupName }
    })
  })
  return out
})()

export const summaryCards = (
  questionNumbers: Array<string>,
  block: Cas1OASysGroup,
  result?: ApiOutcome,
): Array<SummaryListWithCard> => {
  return questionNumbers
    .map(qNumber => {
      const question: OASysQuestion = block?.answers
        ? block.answers.find(({ questionNumber }) => questionNumber === qNumber)
        : undefined
      const definition = oasysQuestionDetailsByNumber[qNumber]
      const error = result && loadingErrorMessage(result, oasysGroupMapping[definition.groupName], 'oasys')
      return (
        (error || question) &&
        card({
          title: definition.label,
          html:
            error ||
            `${oasysMetadataRow(qNumber, oasysGroupMapping[definition.groupName], block)}${question.answer ? detailsBody('View information', question.answer) : '<p class="govuk-hint">Not entered in OASys</p>'}`,
        })
      )
    })
    .filter(Boolean)
}

export const roshWidget = (params: RoshRisks) => {
  return card({ html: nunjucks.render(`components/riskWidgets/rosh-widget/template.njk`, { params }) })
}

export const registrationRows = (registrations: Array<Registration>): Array<TableRow> => {
  return registrations.map(registration => {
    const riskFlagGroup = registration.riskFlagGroupDescription ? `${registration.riskFlagGroupDescription}<br>` : ''
    const dateAdded = registration.startDate
      ? `<p class="govuk-body-s">Added on ${DateFormats.isoDateToUIDate(registration.startDate, { format: 'short' })}</p>`
      : ''
    const flagHtml = `<strong>${registration.description}</strong><br>${riskFlagGroup}<br>${dateAdded}`

    const isOasysImportedFlag = [
      'risk to staff',
      'risk to children',
      'risk to known adult',
      'risk to prisoner',
      'risk to public',
    ].includes(registration.description.toLowerCase())

    let notesHtml = '<p class="govuk-body">No information in NDelius</p>'

    if (registration.riskNotesDetail.length > 0) {
      const [{ note }] = registration.riskNotesDetail // As agreed, we need only the first (latest) note to render
      notesHtml = isOasysImportedFlag
        ? detailsBodyWithPreview(`View full OASys notes for ${registration.description.toLowerCase()}`, note)
        : `<p class="govuk-body govuk-body__text-block">${note}</p>`
    }

    return [{ html: flagHtml, classes: 'govuk-!-width-one-third' }, htmlCell(notesHtml)]
  })
}

export const ndeliusRiskCards = (
  crn: string,
  registrations: Array<Registration> | undefined,
  caseDetailOutcome?: ApiOutcome,
) => {
  // TODO: Risk Flags Feature Flag to be removed once tested!
  if (!config.flags.ndeliusRiskFlagsEnabled) {
    return []
  }

  const errorMessage = caseDetailOutcome && loadingErrorMessage(caseDetailOutcome, 'risk flag', 'nDelius')

  const headingCard = card({
    html: subHeadingH2('NDelius risk flags (registers)'),
  })

  if (errorMessage) {
    return [
      headingCard,
      card({
        title: 'NDelius risk flags',
        html: errorMessage,
      }),
    ]
  }

  const rows = registrationRows(registrations ?? [])
  return [
    headingCard,
    card({
      html: insetText(
        ndeliusDeeplink({
          crn,
          text: 'View risk information in NDelius (opens in a new tab).',
          component: 'RegisterSummary',
        }),
      ),
    }),
    card({
      title: 'NDelius risk flags',
      ...(rows.length
        ? { table: { head: [textCell('Flag'), textCell('Notes')], rows } }
        : { html: '<p class="govuk-body">No risk flags</p>' }),
    }),
  ]
}

export const riskOasysCards = ({
  crn,
  placement,
  personRisks,
  roshSummary,
  roshResult,
  riskManagementPlan,
  rmResult,
  offenceDetails,
  offenceResult,
}: {
  crn: string
  placement: Cas1SpaceBooking
  personRisks: PersonRisks
  roshSummary: Cas1OASysGroup
  roshResult: ApiOutcome
  riskManagementPlan: Cas1OASysGroup
  rmResult: ApiOutcome
  offenceDetails: Cas1OASysGroup
  offenceResult: ApiOutcome
}): Array<SummaryListWithCard> => {
  const headingCard = card({ html: subHeadingH2('OASys risk assessments') })
  if (roshSummary?.assessmentMetadata?.hasApplicableAssessment === false)
    return [
      headingCard,
      card({
        html: `${subHeadingH3('No recent OASys risk assessment available')}<p>No OASys assessment has been completed in the last 6 months. Check OASys for all assessments.</p>`,
      }),
    ]
  return [
    headingCard,
    roshWidget(personRisks.roshRisks?.status?.toLowerCase() === 'retrieved' && personRisks.roshRisks.value),
    card({ html: subHeadingH3('Risk assessment') }),
    card({
      html: insetText(
        roshSummary?.assessmentMetadata?.hasApplicableAssessment
          ? `Assessment completed on ${DateFormats.isoDateToUIDate(roshSummary?.assessmentMetadata?.dateCompleted)}`
          : `<p class="govuk-!-margin-bottom-2">No OASys risk assessment for person added</p><p>Go to the ${linkTo(paths.resident.tabPlacement.application({ placementId: placement.id, crn }), { text: 'application' })} to view risk information for this person.</p>`,
      ),
    }),
    ...summaryCards(['R10.1', 'R10.2'], roshSummary, roshResult),
    ...summaryCards(['RM30', 'RM31', 'RM32', 'RM34'], riskManagementPlan, rmResult),
    ...summaryCards(['2.4.1', '2.4.2'], offenceDetails, offenceResult),
    ...summaryCards(['RM33'], riskManagementPlan, rmResult),
    ...summaryCards(['SUM10'], roshSummary, roshResult),
  ]
}

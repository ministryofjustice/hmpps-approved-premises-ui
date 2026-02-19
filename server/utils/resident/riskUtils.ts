import { Cas1OASysGroup, Cas1OASysGroupName, OASysQuestion, RoshRisks } from '@approved-premises/api'
import { SummaryListWithCard } from '@approved-premises/ui'
import nunjucks from 'nunjucks'
import {
  card,
  detailsBody,
  insetText,
  loadingErrorMessage,
  ndeliusDeeplink,
  ResidentProfileSubTab,
  subHeadingH2,
} from './index'
import paths from '../../paths/manage'
import { DateFormats } from '../dateUtils'
import { ApiOutcome } from '../utils'

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
      const error =
        result &&
        loadingErrorMessage({
          result,
          item: oasysGroupMapping[definition.groupName],
          source: 'OASys',
        })

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

export const ndeliusRiskCard = (crn: string) =>
  card({
    html: `${subHeadingH2('NDelius risk flags (registers)')}${insetText(ndeliusDeeplink({ crn, text: 'View risk information in NDelius (opens in a new tab)', component: 'RegisterSummary' }))}`,
  })

export const riskOasysCards = ({
  roshSummary,
  roshResult,
  riskManagementPlan,
  rmResult,
  offenceDetails,
  offenceResult,
}: {
  roshSummary: Cas1OASysGroup
  roshResult: ApiOutcome
  riskManagementPlan: Cas1OASysGroup
  rmResult: ApiOutcome
  offenceDetails: Cas1OASysGroup
  offenceResult: ApiOutcome
}): Array<SummaryListWithCard> => {
  return [
    ...summaryCards(['R10.1', 'R10.2'], roshSummary, roshResult),
    ...summaryCards(['RM30', 'RM31', 'RM32'], riskManagementPlan, rmResult),
    ...summaryCards(['2.4.1', '2.4.2'], offenceDetails, offenceResult),
    ...summaryCards(['RM33'], riskManagementPlan, rmResult),
    ...summaryCards(['SUM10'], roshSummary, roshResult),
  ]
}

import { Cas1OASysGroup, OASysQuestion, PersonRisks, RoshRisks } from '@approved-premises/api'
import { SummaryListWithCard } from '@approved-premises/ui'
import nunjucks from 'nunjucks'
import { card, detailsBody, ndeliusDeeplink, ResidentProfileSubTab } from './index'
import { textCell } from '../tableUtils'
import paths from '../../paths/manage'
import { DateFormats } from '../dateUtils'

export const riskSideNavigation = (subTab: ResidentProfileSubTab, crn: string, placementId: string) => {
  return [
    {
      text: 'Risk details',
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

export const summaryCards = (
  questionNumbers: Array<string>,
  block: Cas1OASysGroup,
  blockName: string,
): Array<SummaryListWithCard> =>
  questionNumbers
    .map(qNumber => {
      const question: OASysQuestion = block?.answers
        ? block.answers.find(({ questionNumber }) => questionNumber === qNumber)
        : undefined
      return (
        question &&
        card({
          title: question.label,
          html: `${oasysMetadataRow(qNumber, blockName, block)}${question.answer ? detailsBody('View information', question.answer) : '<p class="govuk-hint">Not entered in OAsys</p>'}`,
        })
      )
    })
    .filter(Boolean)

export const roshWidget = (params: RoshRisks) => {
  return card({ html: nunjucks.render(`components/riskWidgets/rosh-widget/template.njk`, { params }) })
}

export const ndeliusRiskCard = (crn: string, personRisks: PersonRisks) =>
  card({
    title: 'NDelius risk flags',
    html: ndeliusDeeplink({ crn, text: 'View risk flags in NDelius', component: 'RegisterSummary' }),
    table: { head: [textCell('Risk flag')], rows: personRisks.flags.value.map(risk => [textCell(risk)]) },
  })

export const insetText = (html: string): string => {
  return nunjucks.render(`partials/insetText.njk`, { html })
}

export const riskOasysCards = (
  roshSummary: Cas1OASysGroup,
  riskManagement: Cas1OASysGroup,
  offenceDetails: Cas1OASysGroup,
): Array<SummaryListWithCard> => {
  return [
    ...summaryCards(['R10.1', 'R10.2'], roshSummary, 'ROSH summary'),
    ...summaryCards(['RM30', 'RM31', 'RM32'], riskManagement, 'OASys risk management plan'),
    ...summaryCards(['2.4.1', '2.4.2'], offenceDetails, 'OASys offence details'),
    ...summaryCards(['RM33'], riskManagement, 'OASys risk management plan'),
    ...summaryCards(['SUM10'], roshSummary, 'ROSH summary'),
  ]
}

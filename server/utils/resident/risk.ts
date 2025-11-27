import { Cas1OASysGroup, OASysQuestion } from '@approved-premises/api'
import { SummaryListWithCard } from '@approved-premises/ui'
import { detailsBody } from './index'

const card = (title: string, html: string) => ({
  card: {
    title: { text: title },
  },
  html,
})

const tableRow = (content: string) =>
  `<table class="govuk-table">
  <tbody class="govuk-table__body">
  <tr class="govuk-table__row">
  <td class="govuk-table__cell">
    ${content}
  </td>
  </tr>
  </tbody>
  </table>`

export const summaryCards = (
  questionNumbers: Array<string>,
  block: Cas1OASysGroup,
  blockName: string,
): Array<SummaryListWithCard> => {
  return questionNumbers
    .map(qNumber => {
      const question: OASysQuestion = block.answers.find(({ questionNumber }) => questionNumber === qNumber)
      return (
        question &&
        card(
          question.label,
          `${tableRow(`${qNumber} ${blockName}`)}${detailsBody('View information', question.answer)}`,
        )
      )
    })
    .filter(Boolean)
}

export const riskOasysCards = (
  roshSummary: Cas1OASysGroup,
  riskManagement: Cas1OASysGroup,
  offenceDetails: Cas1OASysGroup,
  supportingInformation: Cas1OASysGroup,
): Array<SummaryListWithCard> => {
  return [
    ...summaryCards(['R10.1', 'R10.2'], roshSummary, 'ROSH summary'),
    ...summaryCards(['RM30', 'RM31', 'RM32'], riskManagement, 'OASys risk management plan'),
    ...summaryCards(['2.4.1', '2.4.2'], offenceDetails, 'OASys'),
    ...summaryCards(['RM33'], riskManagement, 'OASys risk management plan'),
    ...summaryCards(['8.9', '9.9'], supportingInformation, 'OASys supporting information'),
  ]
}

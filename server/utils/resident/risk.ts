import { Cas1OASysGroup, OASysQuestion, RoshRisks } from '@approved-premises/api'
import { SummaryListWithCard } from '@approved-premises/ui'
import nunjucks from 'nunjucks'
import { card, detailsBody, TabControllerParameters, TabData } from './index'
import { DateFormats } from '../dateUtils'

export const tableRow = (content: string) =>
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
        card({
          title: question.label,
          html: `${tableRow(`${qNumber} ${blockName}`)}${detailsBody('View information', question.answer)}`,
        })
      )
    })
    .filter(Boolean)
}

export const roshWidget = (params: RoshRisks) => {
  return card({ html: nunjucks.render(`components/riskWidgets/rosh-widget/template.njk`, { params }) })
}

const insetText = (html: string): string => {
  return nunjucks.render(`partials/insetText.njk`, { html })
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
    ...summaryCards(['SUM10'], roshSummary, 'ROSH summary'),
    ...summaryCards(['8.9', '9.9'], supportingInformation, 'OASys supporting information'),
  ]
}

export const riskTabController = async ({
  personService,
  token,
  crn,
  personRisks,
}: TabControllerParameters): Promise<TabData> => {
  const [roshSummary, riskManagementPlan, offenceDetails, supportingInformation]: [
    Cas1OASysGroup,
    Cas1OASysGroup,
    Cas1OASysGroup,
    Cas1OASysGroup,
  ] = await Promise.all([
    personService.getOasysAnswers(token, crn, 'roshSummary'),
    personService.getOasysAnswers(token, crn, 'riskManagementPlan'),
    personService.getOasysAnswers(token, crn, 'offenceDetails'),
    personService.getOasysAnswers(token, crn, 'supportingInformation'),
  ])

  return {
    subHeading: 'OASys risks',
    cardList: [
      card({
        html: insetText(
          `OASys last updated on ${DateFormats.isoDateToUIDate(roshSummary.assessmentMetadata.dateCompleted)}`,
        ),
      }),
      roshWidget(personRisks.roshRisks?.status?.toLowerCase() === 'retrieved' && personRisks.roshRisks.value),
      ...riskOasysCards(roshSummary, riskManagementPlan, offenceDetails, supportingInformation),
    ],
  }
}

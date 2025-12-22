import { Cas1OASysGroup, OASysQuestion, RoshRisks } from '@approved-premises/api'
import { SummaryListWithCard } from '@approved-premises/ui'
import nunjucks from 'nunjucks'
import { card, detailsBody, insetText, TabControllerParameters, TabData } from './index'
import { DateFormats } from '../dateUtils'
import { linkTo, settlePromises } from '../utils'
import paths from '../../paths/manage'

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
      const question: OASysQuestion = block?.answers
        ? block.answers.find(({ questionNumber }) => questionNumber === qNumber)
        : undefined
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
  placement,
}: TabControllerParameters): Promise<TabData> => {
  const [roshSummary, riskManagementPlan, offenceDetails, supportingInformation] = await settlePromises<
    [Cas1OASysGroup, Cas1OASysGroup, Cas1OASysGroup, Cas1OASysGroup]
  >([
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
          roshSummary
            ? `OASys last updated on ${DateFormats.isoDateToUIDate(roshSummary?.assessmentMetadata?.dateCompleted)}`
            : `<p class="govuk-!-margin-bottom-2">No OASys risk assessment for person added</p><p>Go to the ${linkTo(paths.resident.tabPlacement.application({ placementId: placement.id, crn }), { text: 'application' })} to view risk information for this person.</p>`,
        ),
      }),
      roshWidget(personRisks.roshRisks?.status?.toLowerCase() === 'retrieved' && personRisks.roshRisks.value),
      ...riskOasysCards(roshSummary, riskManagementPlan, offenceDetails, supportingInformation),
    ],
  }
}

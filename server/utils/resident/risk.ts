import { Cas1OASysGroup } from '@approved-premises/api'
import { card, TabData } from './index'
import { DateFormats } from '../dateUtils'
import { TabControllerParameters } from './TabControllerParameters'
import { insetText, riskOasysCards, roshWidget } from './riskUtils'
import { linkTo, settlePromises } from '../utils'
import paths from '../../paths/manage'

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
          roshSummary?.assessmentMetadata?.hasApplicableAssessment
            ? `OASys last updated on ${DateFormats.isoDateToUIDate(roshSummary?.assessmentMetadata?.dateCompleted)}`
            : `<p class="govuk-!-margin-bottom-2">No OASys risk assessment for person added</p><p>Go to the ${linkTo(paths.resident.tabPlacement.application({ placementId: placement.id, crn }), { text: 'application' })} to view risk information for this person.</p>`,
        ),
      }),
      roshWidget(personRisks.roshRisks?.status?.toLowerCase() === 'retrieved' && personRisks.roshRisks.value),
      ...riskOasysCards(roshSummary, riskManagementPlan, offenceDetails, supportingInformation),
    ],
  }
}

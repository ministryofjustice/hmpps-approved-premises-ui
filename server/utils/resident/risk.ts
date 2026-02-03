import { Cas1OASysGroup } from '@approved-premises/api'
import { card, TabData } from './index'
import { DateFormats } from '../dateUtils'
import { TabControllerParameters } from './TabControllerParameters'
import { insetText, ndeliusRiskCard, riskOasysCards, roshWidget } from './riskUtils'
import { linkTo, settlePromisesWithOutcomes } from '../utils'
import paths from '../../paths/manage'

export const riskTabController = async ({
  personService,
  token,
  crn,
  personRisks,
  placement,
}: TabControllerParameters): Promise<TabData> => {
  const {
    values: [roshSummary, riskManagementPlan, offenceDetails],
    outcomes: [roshResult, rmResult, offenceResult],
  } = await settlePromisesWithOutcomes<[Cas1OASysGroup, Cas1OASysGroup, Cas1OASysGroup]>([
    personService.getOasysAnswers(token, crn, 'roshSummary'),
    personService.getOasysAnswers(token, crn, 'riskManagementPlan'),
    personService.getOasysAnswers(token, crn, 'offenceDetails'),
  ])

  return {
    subHeading: 'Risk information',
    cardList: [
      ndeliusRiskCard(crn, personRisks),
      card({
        html: insetText(
          roshSummary?.assessmentMetadata?.hasApplicableAssessment
            ? `OASys last updated on ${DateFormats.isoDateToUIDate(roshSummary?.assessmentMetadata?.dateCompleted)}`
            : `<p class="govuk-!-margin-bottom-2">No OASys risk assessment for person added</p><p>Go to the ${linkTo(paths.resident.tabPlacement.application({ placementId: placement.id, crn }), { text: 'application' })} to view risk information for this person.</p>`,
        ),
      }),
      roshWidget(personRisks.roshRisks?.status?.toLowerCase() === 'retrieved' && personRisks.roshRisks.value),
      ...riskOasysCards({ roshSummary, roshResult, riskManagementPlan, rmResult, offenceDetails, offenceResult }),
    ],
  }
}

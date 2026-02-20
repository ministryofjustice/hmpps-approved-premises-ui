import { BookingDetails, Cas1OASysGroup, PersonAcctAlert } from '@approved-premises/api'
import { TabControllerParameters } from './TabControllerParameters'
import { TabData } from './index'
import { healthDetailsCards, mentalHealthCards } from './healthUtils'
import { ApiOutcome, settlePromisesWithOutcomes } from '../utils'

export const healthTabController = async ({ personService, token, crn }: TabControllerParameters): Promise<TabData> => {
  const {
    values: [supportingInformation, bookingDetails],
    outcomes: [supportingInformationOutcome],
  }: { values: [Cas1OASysGroup, BookingDetails]; outcomes: Array<ApiOutcome> } = await settlePromisesWithOutcomes([
    personService.getOasysAnswers(token, crn, 'supportingInformation', [13]),
    personService.getBookingDetails(token, crn),
  ])
  return {
    subHeading: 'Health and disability',
    cardList: healthDetailsCards(supportingInformation, supportingInformationOutcome, bookingDetails),
  }
}

export const mentalHealthTabController = async ({
  personService,
  token,
  crn,
}: TabControllerParameters): Promise<TabData> => {
  const {
    values: [personAcctAlerts, riskToSelf, supportingInformation],
    outcomes: [personAcctAlertsOutcome, riskToSelfOutcome, supportingInformationOutcome],
  }: { values: [Array<PersonAcctAlert>, Cas1OASysGroup, Cas1OASysGroup]; outcomes: Array<ApiOutcome> } =
    await settlePromisesWithOutcomes([
      personService.getAcctAlerts(token, crn),
      personService.getOasysAnswers(token, crn, 'riskToSelf'),
      personService.getOasysAnswers(token, crn, 'supportingInformation', [10]),
    ])
  return {
    subHeading: 'Mental health',
    cardList: mentalHealthCards({
      personAcctAlerts,
      personAcctAlertsOutcome,
      riskToSelf,
      riskToSelfOutcome,
      supportingInformation,
      supportingInformationOutcome,
    }),
  }
}

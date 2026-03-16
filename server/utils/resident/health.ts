import { BookingDetails, Cas1OASysGroup, DietAndAllergyResponse, PersonAcctAlert } from '@approved-premises/api'
import { TabControllerParameters } from './TabControllerParameters'
import { TabData } from './index'
import { healthDetailsCards, mentalHealthCards } from './healthUtils'
import { ApiOutcome, settlePromisesWithOutcomes } from '../utils'

export const healthTabController = async ({
  personService,
  token,
  crn,
  placement,
}: TabControllerParameters): Promise<TabData> => {
  const {
    values: [supportingInformation, bookingDetails, dietAndAllergy],
    outcomes: [supportingInformationOutcome, bookingDetailsOutcome, dietAndAllergyOutcome],
  }: { values: [Cas1OASysGroup, BookingDetails, DietAndAllergyResponse]; outcomes: Array<ApiOutcome> } =
    await settlePromisesWithOutcomes([
      personService.getOasysAnswers(token, crn, 'supportingInformation', [13]),
      personService.getBookingDetails(token, crn),
      personService.getDietAndAllergyDetails(token, crn),
    ])
  return {
    subHeading: 'Health and disability',
    cardList: healthDetailsCards({
      supportingInformation,
      supportingInformationOutcome,
      bookingDetails,
      bookingDetailsOutcome,
      dietAndAllergy,
      dietAndAllergyOutcome,
      crn,
      placementId: placement?.id,
    }),
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

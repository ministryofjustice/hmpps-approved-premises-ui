import { BookingDetails, Cas1OASysGroup, Cas1SpaceBooking, PersonAcctAlert } from '@approved-premises/api'
import { TabControllerParameters } from './TabControllerParameters'
import { TabData, card, insetText } from './index'
import { healthDetailsCards, mentalHealthCards } from './healthUtils'
import { ApiOutcome, linkTo, settlePromisesWithOutcomes } from '../utils'
import paths from '../../paths/manage'

export const healthTabController = async ({
  personService,
  token,
  crn,
  placement,
}: TabControllerParameters & { placement: Cas1SpaceBooking }): Promise<TabData> => {
  const {
    values: [supportingInformation, bookingDetails],
    outcomes: [supportingInformationOutcome, bookingDetailsOutcome],
  }: { values: [Cas1OASysGroup, BookingDetails]; outcomes: Array<ApiOutcome> } = await settlePromisesWithOutcomes([
    personService.getOasysAnswers(token, crn, 'supportingInformation', [13]),
    personService.getBookingDetails(token, crn),
  ])

  const linkCard = card({
    html: insetText(
      `Go to the ${linkTo(paths.resident.tabPlacement.application({ crn: placement.person.crn, placementId: placement.id }), { text: 'application and assessment page' })} to check if any access, cultural and healthcare needs were added to the application.`,
    ),
  })

  return {
    subHeading: 'Health and disability',
    cardList: [
      linkCard,
      ...healthDetailsCards(supportingInformation, supportingInformationOutcome, bookingDetails, bookingDetailsOutcome),
    ],
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

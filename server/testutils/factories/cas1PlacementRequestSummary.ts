import { Factory } from 'fishery'
import {
  Cas1PlacementRequestDetail,
  Cas1PlacementRequestSummary,
  type PlacementRequestStatus,
} from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'
import { fullPersonFactory } from './person'
import risksFactory from './risks'
import cas1SpaceBookingSummaryFactory from './cas1SpaceBookingSummary'

class Cas1PlacementRequestSummaryFactory extends Factory<Cas1PlacementRequestSummary> {
  matched() {
    const booking = cas1SpaceBookingSummaryFactory.upcoming().build()

    return this.params({
      placementRequestStatus: 'matched',
      firstBookingArrivalDate: booking.expectedArrivalDate,
      firstBookingPremisesName: booking.premises.name,
    })
  }

  notMatched() {
    return this.params({
      placementRequestStatus: 'notMatched',
    })
  }

  unableToMatch() {
    return this.params({
      placementRequestStatus: 'unableToMatch',
    })
  }

  fromPlacementRequestDetail(placementRequestDetail: Cas1PlacementRequestDetail) {
    const { id, applicationId, isParole, person } = placementRequestDetail

    return this.params({
      id,
      applicationId,
      isParole,
      person,
      applicationSubmittedDate: placementRequestDetail.applicationDate,
      personTier: placementRequestDetail.risks.tier.value.level,
      placementRequestStatus: placementRequestDetail.status,
      requestedPlacementArrivalDate: placementRequestDetail.authorisedPlacementPeriod.arrival,
      requestedPlacementDuration: placementRequestDetail.authorisedPlacementPeriod.duration,
      firstBookingArrivalDate: placementRequestDetail.booking?.arrivalDate,
      firstBookingPremisesName: placementRequestDetail.booking?.premisesName,
    })
  }
}

export default Cas1PlacementRequestSummaryFactory.define(() => {
  const applicationDate = faker.date.past()
  const requestedPlacementArrivalDate = faker.date.future()

  return {
    id: faker.string.uuid(),
    applicationId: faker.string.uuid(),
    applicationSubmittedDate: DateFormats.dateObjToIsoDate(applicationDate),
    isParole: faker.datatype.boolean(),
    person: fullPersonFactory.build(),
    personTier: risksFactory.build().tier.value.level,
    placementRequestStatus: 'notMatched' as PlacementRequestStatus,
    requestedPlacementArrivalDate: DateFormats.dateObjToIsoDate(requestedPlacementArrivalDate),
    requestedPlacementDuration: 84,
  }
})

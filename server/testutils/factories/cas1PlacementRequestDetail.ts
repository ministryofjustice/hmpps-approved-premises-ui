import { Factory } from 'fishery'
import type {
  Cas1SpaceBookingSummary,
  PlacementRequestBookingSummary,
  Cas1PlacementRequestDetail,
  PlacementRequestStatus,
  Cas1ChangeRequestSummary,
  Cas1Application,
  ReleaseTypeOption,
  PlacementRequestRequestType,
  ApType,
  AssessmentDecision,
  WithdrawPlacementRequestReason,
  PlacementCriteria,
} from '@approved-premises/api'

import { faker } from '@faker-js/faker/locale/en_GB'
import cas1SpaceBookingSummaryFactory from './cas1SpaceBookingSummary'
import placementRequestBookingSummaryFactory from './placementRequestBookingSummary'
import { DateFormats } from '../../utils/dateUtils'
import userFactory from './user'
import postcodeAreas from '../../etc/postcodeAreas.json'
import { fullPersonFactory } from './person'
import { allReleaseTypes } from '../../utils/applications/releaseTypeUtils'
import risksFactory from './risks'
import { apTypeLongLabels } from '../../utils/apTypeLabels'
import { placementCriteriaLabels } from '../../utils/placementCriteriaUtils'
import {
  noCapacityReasons,
  placementNoLongerNeededReasons,
  problemInPlacementReasons,
} from '../../utils/applications/withdrawables/withdrawalReasons'

class Cas1PlacementRequestDetailFactory extends Factory<Cas1PlacementRequestDetail> {
  matched() {
    return this.params({
      status: 'matched',
    })
  }

  notMatched() {
    return this.params({
      status: 'notMatched',
    })
  }

  unableToMatch() {
    return this.params({
      status: 'unableToMatch',
    })
  }

  withSpaceBooking(booking?: Cas1SpaceBookingSummary, changeRequest?: Cas1ChangeRequestSummary) {
    const spaceBooking = booking || cas1SpaceBookingSummaryFactory.build()
    const bookingSummary = placementRequestBookingSummaryFactory.fromSpaceBooking(spaceBooking).build()
    return this.params({
      booking: bookingSummary,
      legacyBooking: undefined,
      spaceBookings: [spaceBooking],
      openChangeRequests: changeRequest ? [changeRequest] : [],
    })
  }
}

export const placementCriteria = Object.keys(placementCriteriaLabels) as Array<PlacementCriteria>

export default Cas1PlacementRequestDetailFactory.define(({ params }) => {
  const assessmentDate = faker.date.past()
  const applicationDate = faker.date.recent({ refDate: assessmentDate })
  const spaceBooking = cas1SpaceBookingSummaryFactory.upcoming().build()
  const bookingSummary = placementRequestBookingSummaryFactory.fromSpaceBooking(spaceBooking).build()

  const skipBooking = (['notMatched', 'unableToMatch'] as Array<PlacementRequestStatus>).includes(params.status)

  const essentialCriteria = faker.helpers.arrayElements(placementCriteria)
  const desirableCriteria = essentialCriteria.filter(criteria => !essentialCriteria.includes(criteria))

  return {
    application: {} as Cas1Application,
    applicationDate: DateFormats.dateObjToIsoDateTime(applicationDate),
    applicationId: faker.string.uuid(),
    assessmentDate: DateFormats.dateObjToIsoDateTime(assessmentDate),
    assessmentDecision: 'accepted' as AssessmentDecision,
    assessmentId: faker.string.uuid(),
    assessor: userFactory.build(),
    booking: skipBooking ? undefined : bookingSummary,
    desirableCriteria,
    duration: faker.number.int({ min: 7, max: 84 }),
    essentialCriteria,
    expectedArrival: skipBooking ? undefined : spaceBooking.expectedArrivalDate,
    id: faker.string.uuid(),
    isParole: faker.datatype.boolean(),
    isWithdrawn: false,
    legacyBooking: undefined as PlacementRequestBookingSummary,
    location: faker.helpers.arrayElement(postcodeAreas),
    notes: faker.helpers.arrayElement([faker.lorem.sentences(), undefined]),
    openChangeRequests: [] as Array<Cas1ChangeRequestSummary>,
    person: fullPersonFactory.build(),
    radius: faker.number.int({ min: 0, max: 100 }),
    releaseType: faker.helpers.arrayElement(Object.keys(allReleaseTypes)) as ReleaseTypeOption,
    requestType: faker.helpers.arrayElement(['parole', 'standardRelease', undefined]) as PlacementRequestRequestType,
    risks: risksFactory.build(),
    spaceBookings: skipBooking ? [] : [spaceBooking],
    status: (skipBooking ? 'notMatched' : 'matched') as PlacementRequestStatus,
    type: faker.helpers.arrayElement(Object.keys(apTypeLongLabels)) as ApType,
    withdrawalReason: params.isWithdrawn
      ? (faker.helpers.arrayElement([
          ...placementNoLongerNeededReasons,
          ...noCapacityReasons,
          ...problemInPlacementReasons,
        ]) as WithdrawPlacementRequestReason)
      : undefined,
  }
})

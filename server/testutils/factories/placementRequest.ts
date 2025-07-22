import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import {
  ApType,
  PlacementCriteria,
  PlacementRequest,
  PlacementRequestRequestType,
  PlacementRequestStatus,
  type ReleaseTypeOption,
  WithdrawPlacementRequestReason,
} from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import { fullPersonFactory } from './person'
import risksFactory from './risks'
import userFactory from './user'
import placementRequestBookingSummaryFactory from './placementRequestBookingSummary'
import postcodeAreas from '../../etc/postcodeAreas.json'
import { placementCriteriaLabels } from '../../utils/placementCriteriaUtils'
import { allReleaseTypes } from '../../utils/applications/releaseTypeUtils'
import { apTypeLongLabels } from '../../utils/apTypeLabels'

class PlacementRequestFactory extends Factory<PlacementRequest> {
  withFullPerson() {
    return this.params({
      person: fullPersonFactory.build(),
    })
  }

  notMatched() {
    return this.params({
      status: 'notMatched',
      booking: undefined,
    })
  }

  unableToMatch() {
    return this.notMatched().params({
      status: 'unableToMatch',
    })
  }
}

export default PlacementRequestFactory.define(() => {
  const essentialCriteria = faker.helpers.arrayElements(placementCriteria)
  const desirableCriteria = essentialCriteria.filter(criteria => !essentialCriteria.includes(criteria))
  return {
    id: faker.string.uuid(),
    type: faker.helpers.arrayElement(Object.keys(apTypeLongLabels)) as ApType,
    expectedArrival: DateFormats.dateObjToIsoDate(faker.date.soon()),
    duration: faker.number.int({ min: 1, max: 12 }),
    location: faker.helpers.arrayElement(postcodeAreas),
    radius: faker.number.int({ min: 1, max: 50 }),
    essentialCriteria,
    desirableCriteria,
    mentalHealthSupport: faker.datatype.boolean(),
    person: fullPersonFactory.build(),
    risks: risksFactory.build(),
    applicationId: faker.string.uuid(),
    assessmentId: faker.string.uuid(),
    releaseType: faker.helpers.arrayElement(Object.keys(allReleaseTypes)) as ReleaseTypeOption,
    status: 'matched' as PlacementRequestStatus,
    assessmentDecision: faker.helpers.arrayElement(['accepted' as const, 'rejected' as const]),
    applicationDate: DateFormats.dateObjToIsoDateTime(faker.date.soon()),
    assessmentDate: DateFormats.dateObjToIsoDateTime(faker.date.soon()),
    assessor: userFactory.build(),
    isParole: false,
    booking: placementRequestBookingSummaryFactory.build(),
    isWithdrawn: false,
    withdrawalReason: faker.helpers.arrayElement([
      'DuplicatePlacementRequest',
      undefined,
    ]) as WithdrawPlacementRequestReason,
    requestType: faker.helpers.arrayElement(['parole', 'standardRelease', undefined]) as PlacementRequestRequestType,
    notes: faker.helpers.arrayElement([faker.lorem.sentences(), undefined]),
  }
})

export const placementCriteria = Object.keys(placementCriteriaLabels) as Array<PlacementCriteria>

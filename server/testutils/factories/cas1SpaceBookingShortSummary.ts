import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Cas1SpaceBookingShortSummary, Cas1SpaceCharacteristic } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import { allSpaceBookingCharacteristicMap } from '../../utils/characteristicsUtils'
import cas1PremisesFactory from './cas1Premises'
import { statusTextMap } from '../../utils/placements/status'
import { apAreaFactory } from './referenceData'
import cas1NewSpaceBookingCancellationFactory from './cas1NewSpaceBookingCancellation'
import cas1SpaceBookingNonArrivalFactory from './cas1SpaceBookingNonArrival'

const arrivedStatuses = ['arrived', 'departingWithin2Weeks', 'departed', 'departingToday', 'overdueDeparture']

class Cas1SpaceBookingShortSummaryFactory extends Factory<Cas1SpaceBookingShortSummary> {
  upcoming() {
    return this.params({
      actualArrivalDate: undefined,
      actualDepartureDate: undefined,
      isNonArrival: false,
    })
  }

  current() {
    const arrivalDate = faker.date.recent({ days: 42 })
    const departureDate = faker.date.soon({ days: 42 })

    return this.params({
      expectedArrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
      expectedDepartureDate: DateFormats.dateObjToIsoDate(departureDate),
      actualArrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
      actualDepartureDate: undefined,
      isNonArrival: false,
    })
  }

  departed() {
    const departureDate = faker.date.recent({ days: 10 })
    const arrivalDate = faker.date.recent({ days: 84, refDate: departureDate })

    return this.params({
      expectedArrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
      expectedDepartureDate: DateFormats.dateObjToIsoDate(departureDate),
      actualArrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
      actualDepartureDate: DateFormats.dateObjToIsoDate(departureDate),
      isNonArrival: false,
    })
  }

  nonArrival() {
    return this.upcoming().params({
      isNonArrival: true,
      nonArrival: cas1SpaceBookingNonArrivalFactory.build(),
    })
  }

  cancelled() {
    return this.params({
      actualArrivalDate: undefined,
      actualDepartureDate: undefined,
      isNonArrival: false,
      cancellation: cas1NewSpaceBookingCancellationFactory.build(),
    })
  }
}

export default Cas1SpaceBookingShortSummaryFactory.define(() => {
  const canonicalArrivalDate = DateFormats.dateObjToIsoDate(faker.date.soon({ days: 90 }))
  const canonicalDepartureDate = DateFormats.dateObjToIsoDate(
    faker.date.soon({ days: 365, refDate: canonicalArrivalDate }),
  )
  const status = faker.helpers.arrayElement(Object.keys(statusTextMap))

  return {
    id: faker.string.uuid(),
    apArea: apAreaFactory.build(),
    premises: cas1PremisesFactory.build(),
    createdAt: DateFormats.dateObjToIsoDateTime(faker.date.recent()),
    expectedArrivalDate: canonicalArrivalDate,
    expectedDepartureDate: canonicalDepartureDate,
    actualArrivalDate: arrivedStatuses.includes(status) ? canonicalArrivalDate : undefined,
    actualDepartureDate: status === 'departed' ? canonicalDepartureDate : undefined,
    isNonArrival: status === 'notArrived',
    characteristics: faker.helpers.arrayElements(Object.keys(allSpaceBookingCharacteristicMap), {
      min: 0,
      max: 3,
    }) as Array<Cas1SpaceCharacteristic>,
    deliusEventNumber: faker.string.numeric({ length: 6 }),
  }
})

import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type {
  Cas1PremiseCapacity,
  Cas1PremiseCapacityForDay,
  Cas1PremiseCharacteristicAvailability,
  Cas1SpaceBookingCharacteristic,
} from '@approved-premises/api'
import { addDays, differenceInDays } from 'date-fns'
import cas1PremisesFactory from './cas1Premises'
import { DateFormats } from '../../utils/dateUtils'
import { roomCharacteristicMap } from '../../utils/characteristicsUtils'

export default Factory.define<Cas1PremiseCapacity>(({ params }) => {
  const startDate = params.startDate ? DateFormats.isoToDateObj(params.startDate) : faker.date.anytime()
  const endDate = params.endDate
    ? DateFormats.isoToDateObj(params.endDate)
    : faker.date.soon({
        days: 365,
        refDate: startDate,
      })
  const days = differenceInDays(endDate, startDate) + 1

  const capacity = Array.from(Array(days).keys()).map(index =>
    cas1PremiseCapacityForDayFactory.build({
      date: DateFormats.dateObjToIsoDate(addDays(startDate, index)),
    }),
  )

  return {
    premise: cas1PremisesFactory.build(),
    startDate: DateFormats.dateObjToIsoDate(startDate),
    endDate: DateFormats.dateObjToIsoDate(endDate),
    capacity,
  }
})

class CapacityForDayFactory extends Factory<Cas1PremiseCapacityForDay> {
  available() {
    const totalBedCount = faker.number.int({ min: 6, max: 40 })
    const availableBedCount = faker.number.int({ min: totalBedCount - 5, max: totalBedCount })
    const bookingCount = faker.number.int({ min: 0, max: availableBedCount - 1 })

    return this.params({
      totalBedCount,
      availableBedCount,
      bookingCount,
    })
  }

  overbooked() {
    const totalBedCount = faker.number.int({ min: 6, max: 40 })
    const availableBedCount = faker.number.int({ min: totalBedCount - 5, max: totalBedCount })
    const bookingCount = faker.number.int({ min: availableBedCount + 1, max: totalBedCount + 5 })

    return this.params({
      totalBedCount,
      availableBedCount,
      bookingCount,
    })
  }

  full() {
    const totalBedCount = faker.number.int({ min: 6, max: 40 })
    const availableBedCount = faker.number.int({ min: totalBedCount - 5, max: totalBedCount })
    const bookingCount = availableBedCount

    return this.params({
      totalBedCount,
      availableBedCount,
      bookingCount,
    })
  }
}

export const cas1PremiseCapacityForDayFactory = CapacityForDayFactory.define(() => {
  const totalBedCount = faker.number.int({ min: 10, max: 40 })

  return {
    date: DateFormats.dateObjToIsoDate(faker.date.future()),
    totalBedCount,
    availableBedCount: faker.number.int({ min: totalBedCount - 9, max: totalBedCount }),
    bookingCount: faker.number.int({ min: 0, max: totalBedCount + 10 }),
    characteristicAvailability: Object.keys(roomCharacteristicMap).map(characteristic =>
      premiseCharacteristicAvailability.build({ characteristic: characteristic as Cas1SpaceBookingCharacteristic }),
    ),
  }
})

class PremisesCharacteristicAvailability extends Factory<Cas1PremiseCharacteristicAvailability> {
  available() {
    const availableBedsCount = faker.number.int({ min: 5, max: 20 })
    const bookingsCount = faker.number.int({ min: 0, max: availableBedsCount - 1 })

    return this.params({
      availableBedsCount,
      bookingsCount,
    })
  }

  full() {
    const availableBedsCount = faker.number.int({ min: 5, max: 20 })
    const bookingsCount = availableBedsCount

    return this.params({
      availableBedsCount,
      bookingsCount,
    })
  }

  overbooked() {
    const availableBedsCount = faker.number.int({ min: 5, max: 20 })
    const bookingsCount = faker.number.int({ min: availableBedsCount + 1, max: 30 })

    return this.params({
      availableBedsCount,
      bookingsCount,
    })
  }
}

export const premiseCharacteristicAvailability = PremisesCharacteristicAvailability.define(() => ({
  characteristic: faker.helpers.arrayElement(Object.keys(roomCharacteristicMap)) as Cas1SpaceBookingCharacteristic,
  availableBedsCount: faker.number.int({ min: 0, max: 40 }),
  bookingsCount: faker.number.int({ min: 0, max: 45 }),
}))

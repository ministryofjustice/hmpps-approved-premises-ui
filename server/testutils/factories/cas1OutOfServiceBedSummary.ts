import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Cas1OutOfServiceBedSummary, Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import { roomCharacteristicMap } from '../../utils/characteristicsUtils'
import { cas1OutOfServiceBedReasonFactory } from './cas1ReferenceData'

export default Factory.define<Cas1OutOfServiceBedSummary>(({ sequence }) => {
  const characteristics = faker.helpers.arrayElements(Object.keys(roomCharacteristicMap), {
    min: 0,
    max: 3,
  }) as Array<Cas1SpaceBookingCharacteristic>
  return {
    id: faker.string.uuid(),
    bedId: faker.string.uuid(),
    roomName: `${faker.helpers.arrayElement(['Ground floor', 'First floor'])} rm ${faker.number.int({
      min: 1,
      max: 9,
    })}-${sequence}`,
    startDate: DateFormats.dateObjToIsoDate(faker.date.recent({ days: 10 })),
    endDate: DateFormats.dateObjToIsoDate(faker.date.soon({ days: 10 })),
    reason: cas1OutOfServiceBedReasonFactory.build(),
    characteristics,
  }
})

import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import referenceDataFactory from './referenceData'
import { DateFormats } from '../../utils/dateUtils'
import { NewOutOfServiceBed, OutOfServiceBed, OutOfServiceBedCancellation } from '../../@types/ui'

export const outOfServiceBedFactory = Factory.define<OutOfServiceBed>(() => ({
  id: faker.string.uuid(),
  bedId: faker.string.uuid(),
  bedName: faker.lorem.words(3),
  roomName: faker.lorem.words(3),
  notes: faker.lorem.sentence(),
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  endDate: DateFormats.dateObjToIsoDate(faker.date.future()),
  referenceNumber: faker.string.uuid(),
  reason: referenceDataFactory.lostBedReasons().build(),
  status: 'active',
  cancellation: { id: faker.string.uuid(), createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()) },
}))

export const newOutOfServiceBedFactory = Factory.define<NewOutOfServiceBed>(() => {
  const startDate = faker.date.soon()
  const endDate = faker.date.future()
  return {
    id: faker.string.uuid(),
    bedId: faker.string.uuid(),
    notes: faker.lorem.sentence(),
    startDate: DateFormats.dateObjToIsoDate(startDate),
    'startDate-day': startDate.getDate().toString(),
    'startDate-month': startDate.getMonth().toString(),
    'startDate-year': startDate.getFullYear().toString(),
    endDate: DateFormats.dateObjToIsoDate(endDate),
    'endDate-day': endDate.getDate().toString(),
    'endDate-month': endDate.getMonth().toString(),
    'endDate-year': endDate.getFullYear().toString(),
    referenceNumber: faker.string.uuid(),
    reason: referenceDataFactory.lostBedReasons().build().id,
    serviceName: 'approved-premises',
  }
})

export const outOfServiceBedCancellationFactory = Factory.define<OutOfServiceBedCancellation>(() => {
  return {
    createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
    id: faker.string.uuid(),
    notes: faker.lorem.sentence(),
  }
})

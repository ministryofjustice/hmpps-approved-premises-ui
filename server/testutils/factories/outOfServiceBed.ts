import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type {
  Cas1NewOutOfServiceBed,
  Cas1OutOfServiceBed,
  Cas1OutOfServiceBedCancellation,
  Cas1OutOfServiceBedRevision,
} from '@approved-premises/api'

import cas1ReferenceDataFactory from './cas1ReferenceData'
import { DateFormats } from '../../utils/dateUtils'
import userFactory from './user'
import namedIdFactory from './namedId'

export const outOfServiceBedFactory = Factory.define<Cas1OutOfServiceBed>(() => ({
  id: faker.string.uuid(),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  startDate: DateFormats.dateObjToIsoDate(faker.date.future()),
  endDate: DateFormats.dateObjToIsoDate(faker.date.future()),
  bed: namedIdFactory.build(),
  room: namedIdFactory.build(),
  premises: namedIdFactory.build(),
  apArea: namedIdFactory.build(),
  reason: cas1ReferenceDataFactory.outOfServiceBedReason().build(),
  referenceNumber: faker.helpers.arrayElement([faker.string.uuid(), undefined]),
  notes: faker.lorem.sentence(),
  daysLostCount: faker.number.int({ min: 1, max: 100 }),
  temporality: faker.helpers.arrayElement(['past', 'current', 'future'] as const),
  status: faker.helpers.arrayElement(['active', 'cancelled'] as const),
  cancellation: undefined,
  revisionHistory: outOfServiceBedRevisionFactory.buildList(3),
}))

export const newOutOfServiceBedFactory = Factory.define<Cas1NewOutOfServiceBed>(() => {
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
    reason: cas1ReferenceDataFactory.outOfServiceBedReason().build().id,
    serviceName: 'approved-premises',
  }
})

export const outOfServiceBedCancellationFactory = Factory.define<Cas1OutOfServiceBedCancellation>(() => {
  return {
    createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
    id: faker.string.uuid(),
    notes: faker.lorem.sentence(),
  }
})

export const outOfServiceBedRevisionFactory = Factory.define<Cas1OutOfServiceBedRevision>(() => {
  return {
    id: faker.string.uuid(),
    updatedAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
    updatedBy: userFactory.build(),
    revisionType: faker.helpers.arrayElements([
      'created',
      'updatedStartDate',
      'updatedEndDate',
      'updatedReferenceNumber',
      'updatedReason',
      'updatedNotes',
    ] as const),
    startDate: DateFormats.dateObjToIsoDate(faker.date.past()),
    endDate: DateFormats.dateObjToIsoDate(faker.date.future()),
    reason: cas1ReferenceDataFactory.outOfServiceBedReason().build(),
    referenceNumber: faker.number.int({ min: 1000, max: 99999 }).toString(),
    notes: faker.lorem.sentences(2),
  }
})

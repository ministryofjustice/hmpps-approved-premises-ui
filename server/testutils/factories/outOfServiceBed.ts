import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import {
  NamedId,
  NewCas1OutOfServiceBed as NewOutOfServiceBed,
  Cas1OutOfServiceBed as OutOfServiceBed,
  Cas1OutOfServiceBedCancellation as OutOfServiceBedCancellation,
  Cas1OutOfServiceBedRevision as OutOfServiceBedRevision,
} from '../../@types/shared'

import referenceDataFactory from './referenceData'
import { DateFormats } from '../../utils/dateUtils'
import userFactory from './user'

export const outOfServiceBedFactory = Factory.define<OutOfServiceBed>(() => ({
  id: faker.string.uuid(),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  outOfServiceFrom: DateFormats.dateObjToIsoDate(faker.date.future()),
  outOfServiceTo: DateFormats.dateObjToIsoDate(faker.date.future()),
  bed: namedIdFactory.build(),
  room: namedIdFactory.build(),
  premises: namedIdFactory.build(),
  apArea: namedIdFactory.build(),
  reason: referenceDataFactory.outOfServiceBedReason().build(),
  referenceNumber: faker.helpers.arrayElement([faker.string.uuid(), undefined]),
  notes: faker.helpers.arrayElement([faker.lorem.sentence(), undefined]),
  daysLostCount: faker.number.int({ min: 1, max: 100 }),
  temporality: faker.helpers.arrayElement(['past', 'current', 'future'] as const),
  status: faker.helpers.arrayElement(['active', 'cancelled'] as const),
  cancellation: undefined,
  revisionHistory: outOfServiceBedRevisionFactory.buildList(3),
}))

const namedIdFactory = Factory.define<NamedId>(() => ({
  id: faker.string.uuid(),
  name: faker.lorem.word(),
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

export const outOfServiceBedRevisionFactory = Factory.define<OutOfServiceBedRevision>(() => {
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
    outOfServiceFrom: DateFormats.dateObjToIsoDate(faker.date.past()),
    outOfServiceTo: DateFormats.dateObjToIsoDate(faker.date.future()),
    reason: referenceDataFactory.lostBedReasons().build(),
    referenceNumber: faker.number.int({ min: 1000, max: 99999 }).toString(),
    notes: faker.lorem.sentences(2),
  }
})

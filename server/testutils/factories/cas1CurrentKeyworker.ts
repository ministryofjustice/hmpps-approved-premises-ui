import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Cas1CurrentKeyWorker } from '../../@types/shared/models/Cas1CurrentKeyWorker'
import { userSummaryFactory } from './user'

export default Factory.define<Cas1CurrentKeyWorker>(() => ({
  summary: userSummaryFactory.build(),
  currentBookingCount: faker.number.int({ min: 0, max: 20 }),
  upcomingBookingCount: faker.number.int({ min: 0, max: 20 }),
}))

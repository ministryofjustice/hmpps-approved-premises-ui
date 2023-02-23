/* istanbul ignore file */
import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { ContingencyPlanQuestionsBody } from '../../@types/ui'

export default Factory.define<ContingencyPlanQuestionsBody>(() => ({
  noReturn: faker.lorem.sentence(),
  placementWithdrawn: faker.lorem.sentence(),
  victimConsiderations: faker.lorem.sentence(),
  unsuitableAddresses: faker.lorem.sentence(),
  suitableAddresses: faker.lorem.sentence(),
  breachInformation: faker.lorem.sentence(),
  otherConsiderations: faker.lorem.sentence(),
}))

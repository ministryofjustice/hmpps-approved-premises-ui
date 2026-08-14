import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { Cas1CreateApplicationOutcome } from '@approved-premises/api'
import tierDtoFactory from './tierDto'

export default Factory.define<Cas1CreateApplicationOutcome>(() => ({
  applicationId: faker.string.uuid(),
  tier: tierDtoFactory.build(),
}))

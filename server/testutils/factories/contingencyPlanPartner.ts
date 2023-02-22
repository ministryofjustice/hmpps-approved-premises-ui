/* istanbul ignore file */
import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { PartnerAgencyDetails } from '../../@types/ui'

export default Factory.define<PartnerAgencyDetails>(() => ({
  partnerAgencyName: faker.company.name(),
  namedContact: faker.name.fullName(),
  phoneNumber: faker.phone.number(),
  roleInPlan: 'Role in contingency plan',
}))

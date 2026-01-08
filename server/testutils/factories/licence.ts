import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Licence, type LicenceStatus, type LicenceType } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import licenceConditionsFactory from './licenceConditions'

const licenceCodes: ReadonlyArray<LicenceStatus> = [
  'IN_PROGRESS',
  'SUBMITTED',
  'APPROVED',
  'ACTIVE',
  'REJECTED',
  'INACTIVE',
  'RECALLED',
  'VARIATION_IN_PROGRESS',
  'VARIATION_SUBMITTED',
  'VARIATION_REJECTED',
  'VARIATION_APPROVED',
  'NOT_STARTED',
  'TIMED_OUT',
]

class LicenceFactory extends Factory<Licence> {
  active() {
    return this.params({
      statusCode: 'ACTIVE',
    })
  }
}

export default LicenceFactory.define(() => {
  return {
    approvedByUsername: faker.person.fullName(),
    approvedDateTime: DateFormats.dateObjToIsoDateTime(faker.date.recent({ days: 365 })),
    bookingId: faker.number.int({ min: 0, max: 100000 }),
    conditions: licenceConditionsFactory.build(),
    createdByUsername: `${faker.person.firstName()}${faker.person.lastName()}`,
    createdDateTime: DateFormats.dateObjToIsoDateTime(faker.date.recent({ days: 365 })),
    crn: `C${faker.string.numeric({ length: 6, allowLeadingZeros: false })}`,
    id: faker.number.int({ min: 0, max: 100000 }),
    isInPssPeriod: faker.datatype.boolean(),
    kind: faker.word.adjective(),
    licenceStartDate: DateFormats.dateObjToIsoDate(faker.date.recent({ days: 365 })),
    licenceType: faker.helpers.arrayElement(['AP', 'PSS', 'AP_PSS']) as LicenceType,
    policyVersion: faker.string.numeric({ length: 5 }),
    prisonNumber: faker.string.numeric({ length: 6, allowLeadingZeros: false }),
    statusCode: faker.helpers.arrayElement(licenceCodes),
    updatedByUsername: `${faker.person.firstName()}${faker.person.lastName()}`,
    updatedDateTime: DateFormats.dateObjToIsoDateTime(faker.date.recent({ days: 30 })),
    version: faker.string.numeric({ length: 2 }),
  } as Licence
})

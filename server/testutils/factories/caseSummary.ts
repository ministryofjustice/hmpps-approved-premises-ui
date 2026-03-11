import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { CaseSummary } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<CaseSummary>(() => ({
  crn: `${faker.string.alpha({ length: 1 })}${faker.number.int({ min: 100000, max: 999999 })}`,
  currentExclusion: faker.datatype.boolean(),
  currentRestriction: faker.datatype.boolean(),
  dateOfBirth: DateFormats.dateObjToIsoDate(faker.date.past({ years: 90 })),
  gender: faker.helpers.arrayElement(['Male', 'Female']),
  manager: null,
  name: {
    forename: faker.person.firstName(),
    surname: faker.person.firstName(),
    middleNames: [faker.person.middleName()],
  },
  nomsId: `NOMS${faker.number.int({ min: 100, max: 999 })}`,
  pnc: `${faker.number.int({ min: 1000, max: 9999 })}/${faker.number.int({ min: 10000, max: 99999 })}A`,
  profile: {
    ethnicity: faker.helpers.arrayElement(['White', 'Black', 'Asian', 'Mixed', undefined]),
    genderIdentity: faker.helpers.arrayElement(['Man', 'Woman', undefined]),
    religion: faker.helpers.arrayElement(['Christian', 'Muslim', 'Jewish', 'Hindu', 'Buddhist', 'Sikh', 'None']),
    nationality: faker.location.country(),
  },
}))

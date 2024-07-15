import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { FullPerson, PersonSummary, RestrictedPerson } from '@approved-premises/api'
import { FullPersonSummary } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export const getCrn = () => `C${faker.number.int({ min: 100000, max: 999999 })}`
export const fullPersonFactory = Factory.define<FullPerson>(() => ({
  crn: getCrn(),
  name: faker.person.fullName(),
  dateOfBirth: DateFormats.dateObjToIsoDate(faker.date.past()),
  sex: faker.helpers.arrayElement(['Male', 'Female', 'Other', 'Prefer not to say']),
  status: faker.helpers.arrayElement(['InCustody', 'InCommunity']),
  nomsNumber: `NOMS${faker.number.int({ min: 100, max: 999 })}`,
  nationality: faker.location.country(),
  religionOrBelief: faker.helpers.arrayElement(['Christian', 'Muslim', 'Jewish', 'Hindu', 'Buddhist', 'Sikh', 'None']),
  prisonName: `HMP ${faker.location.street()}`,
  type: 'FullPerson',
  isRestricted: Boolean(Math.floor(Math.random())),
}))

export const restrictedPersonFactory = Factory.define<RestrictedPerson>(() => ({
  crn: getCrn(),
  type: 'RestrictedPerson',
}))

export const personSummaryFactory = Factory.define<PersonSummary>(() => ({
  crn: getCrn(),
  personType: faker.helpers.arrayElement(['FullPersonSummary', 'RestrictedPersonSummary', 'UnknownPersonSummary']),
}))

export const restrictedPersonSummaryFactory = Factory.define<PersonSummary>(() => ({
  crn: getCrn(),
  personType: 'RestrictedPersonSummary',
}))

export const fullPersonSummaryFactory = Factory.define<FullPersonSummary>(() => ({
  crn: getCrn(),
  personType: 'FullPersonSummary',
  name: faker.person.fullName(),
}))

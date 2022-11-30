import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Application } from '@approved-premises/api'

import personFactory from './person'
import { DateFormats } from '../../utils/dateUtils'

class ApplicationFactory extends Factory<Application> {
  withReleaseDate(releaseDate = DateFormats.dateObjToIsoDate(faker.date.soon())) {
    return this.params({
      data: {
        ...JSON.parse(faker.datatype.json()),
        'basic-information': {
          'release-date': { releaseDate, knowReleaseDate: 'yes' },
          'placement-date': { startDateSameAsReleaseDate: 'yes' },
        },
      },
    })
  }
}

export default ApplicationFactory.define(() => ({
  id: faker.datatype.uuid(),
  person: personFactory.build(),
  createdByUserId: faker.datatype.uuid(),
  schemaVersion: faker.datatype.uuid(),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  submittedAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  data: JSON.parse(faker.datatype.json()),
  document: JSON.parse(faker.datatype.json()),
  outdatedSchema: faker.datatype.boolean(),
  isWomensApplication: faker.datatype.boolean(),
  isPipeApplication: faker.datatype.boolean(),
}))

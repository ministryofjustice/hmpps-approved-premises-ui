import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { ActiveOffence } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<ActiveOffence>(() => {
  const mainCategoryDescription = faker.lorem.sentence({ min: 1, max: 4 })
  const subCategoryDescription = faker.lorem.sentence({ min: 1, max: 4 })
  return {
    deliusEventNumber: faker.string.uuid(),
    offenceDescription: `${mainCategoryDescription} - ${subCategoryDescription}`,
    offenceId: faker.string.uuid(),
    convictionId: faker.number.int(),
    offenceDate: DateFormats.dateObjToIsoDate(faker.date.past()),
    mainOffence: faker.datatype.boolean(),
    mainCategoryDescription,
    subCategoryDescription,
  }
})

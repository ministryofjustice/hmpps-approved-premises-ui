import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { Offence } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Offence>(() => {
  const mainCategoryDescription = faker.lorem.sentence({ min: 1, max: 4 })
  const subCategoryDescription = faker.lorem.sentence({ min: 1, max: 4 })
  return {
    id: faker.string.uuid(),
    eventNumber: faker.number.int({ min: 1, max: 50 }).toString(),
    description: `${mainCategoryDescription} - ${subCategoryDescription}`,
    offenceId: `M${faker.number.int({ min: 1000000, max: 9999999 })}`,
    convictionId: faker.number.int({ min: 1, max: 1000000 }),
    date: DateFormats.dateObjToIsoDate(faker.date.past()),
    main: faker.datatype.boolean(),
    mainCategoryDescription,
    subCategoryDescription,
    eventId: faker.number.int({ min: 1, max: 1000000 }),
  }
})

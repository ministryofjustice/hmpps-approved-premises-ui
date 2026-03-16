import { Factory } from 'fishery'
import { DietAndAllergyResponse, DietaryItemDto, ValueWithMetadataListDietaryItemDto } from '@approved-premises/api'
import { faker } from '@faker-js/faker/locale/en_GB'
import { DateFormats } from '../../utils/dateUtils'

export const dietaryItemDtoFactory = Factory.define<DietaryItemDto>(() => ({
  comment: faker.word.words({ count: { min: 0, max: 3 } }),
  value: {
    code: faker.string.alphanumeric({ length: { min: 3, max: 10 } }),
    description: faker.word.words({ count: { min: 1, max: 3 } }),
    id: faker.string.numeric(6),
  },
}))

const valueWithMetadataListDietaryItemDtoFactory = Factory.define<ValueWithMetadataListDietaryItemDto>(() => ({
  lastModifiedAt: DateFormats.dateObjToIsoDate(faker.date.recent({ days: 365 })),
  lastModifiedBy: faker.person.fullName(),
  lastModifiedPrisonId: faker.location.city(),
  value: dietaryItemDtoFactory.buildList(faker.number.int({ min: 0, max: 6 })),
}))

export default Factory.define<DietAndAllergyResponse>(() => ({
  dietAndAllergy: {
    cateringInstructions: {
      value: faker.lorem.words(50),
    },
    foodAllergies: valueWithMetadataListDietaryItemDtoFactory.build(),
    lastAdmissionDate: DateFormats.dateObjToIsoDate(faker.date.recent({ days: 365 })),
    medicalDietaryRequirements: valueWithMetadataListDietaryItemDtoFactory.build(),
    personalisedDietaryRequirements: valueWithMetadataListDietaryItemDtoFactory.build(),
    topLevelLocation: faker.location.city(),
  },
}))

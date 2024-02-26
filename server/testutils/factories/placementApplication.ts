import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { PlacementApplication } from '../../@types/shared'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<PlacementApplication>(() => ({
  id: faker.string.uuid(),
  assessmentId: faker.string.uuid(),
  applicationId: faker.string.uuid(),
  applicationCompletedAt: DateFormats.dateObjToIsoDateTime(faker.date.recent()),
  assessmentCompletedAt: DateFormats.dateObjToIsoDateTime(faker.date.recent()),
  createdByUserId: faker.string.uuid(),
  schemaVersion: faker.string.uuid(),
  outdatedSchema: false,
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.recent()),
  submittedAt: DateFormats.dateObjToIsoDateTime(faker.date.recent()),
  data: {},
  document: {},
  canBeWithdrawn: true,
  isWithdrawn: false,
  type: faker.helpers.arrayElement(['Initial', 'Additional']),
  withdrawalReason: faker.helpers.arrayElement([
    'DuplicatePlacementRequest',
    'AlternativeProvisionIdentified',
    'ChangeInCircumstances',
    'ChangeInReleaseDecision',
    'NoCapacityDueToLostBed',
    'NoCapacityDueToPlacementPrioritisation',
    'NoCapacity',
    'ErrorInPlacementRequest',
    'WithdrawnByPP',
    'RelatedApplicationWithdrawn',
    'RelatedPlacementRequestWithdrawn',
    'RelatedPlacementApplicationWithdrawn',
    undefined,
  ]),
}))

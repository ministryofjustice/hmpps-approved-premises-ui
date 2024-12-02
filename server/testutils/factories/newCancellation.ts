import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { NewCancellation } from '@approved-premises/api'
import referenceDataFactory from './referenceData'
import { DateFormats } from '../../utils/dateUtils'
import cancellationReasonsJson from '../referenceData/stubs/cancellation-reasons.json'

export const otherCancellationReasonId = cancellationReasonsJson.find(r => r.name === 'Other').id

class NewCancellationFactory extends Factory<NewCancellation> {
  withOtherReason() {
    return this.params({ reason: otherCancellationReasonId, otherReason: 'other reason' })
  }
}

export default NewCancellationFactory.define(() => {
  const date = faker.date.soon()
  return {
    id: faker.string.uuid(),
    date: DateFormats.dateObjToIsoDate(faker.date.soon()),
    'date-day': date.getDate().toString(),
    'date-month': date.getMonth().toString(),
    'date-year': date.getFullYear().toString(),
    bookingId: faker.string.uuid(),
    reason: referenceDataFactory.cancellationReasons().build().id,
    notes: faker.lorem.sentence(),
  }
})

/* istanbul ignore file */

import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { ClarificationNote } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'

class ClarificationNoteFactory extends Factory<ClarificationNote> {
  createdXDaysAgo(days: number) {
    const today = new Date()
    return this.params({
      createdAt: DateFormats.dateObjToIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - days)),
    })
  }
}

export default ClarificationNoteFactory.define(() => ({
  id: faker.string.uuid(),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  createdByStaffMemberId: faker.string.uuid(),
  query: faker.lorem.sentence(),
  response: faker.lorem.sentence(),
  responseReceivedOn: DateFormats.dateObjToIsoDate(faker.date.past()),
}))

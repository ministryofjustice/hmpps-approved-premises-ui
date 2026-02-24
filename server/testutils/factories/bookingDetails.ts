import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { BookingDetails } from '@approved-premises/api'
import { smokingStatusMapping } from '../../utils/resident/healthUtils'

export default Factory.define<BookingDetails>(() => ({
  bookingId: faker.number.int({ min: 1, max: 100000 }),
  offenderNo: faker.string.alphanumeric(7).toUpperCase(),
  profileInformation: [
    {
      type: 'SMOKE',
      resultValue: faker.helpers.arrayElement(Object.keys(smokingStatusMapping)),
    },
  ],
}))

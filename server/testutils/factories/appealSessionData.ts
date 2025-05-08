import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { AppealSessionData } from '@approved-premises/ui'
import { DateFormats } from '../../utils/dateUtils'
import { transferRequestReasonRadioDefinitions } from '../../utils/placements/changeRequests'

export default Factory.define<AppealSessionData>(() => {
  const approvalDate = faker.date.recent({ days: 5 })
  const appealReason = faker.helpers.arrayElement(Object.keys(transferRequestReasonRadioDefinitions))
  const appealReasonDetails = { [`${appealReason}Detail`]: faker.lorem.lines(3) }
  return {
    areaManagerName: faker.person.fullName(),
    areaManagerEmail: faker.internet.email(),
    appealReason,
    notes: faker.lorem.lines(3),
    approvalDate: DateFormats.dateObjToIsoDate(approvalDate),
    'approvalDate-day': String(approvalDate.getDate()),
    'approvalDate-month': String(approvalDate.getMonth() + 1),
    'approvalDate-year': String(approvalDate.getFullYear()),
    ...appealReasonDetails,
  }
})

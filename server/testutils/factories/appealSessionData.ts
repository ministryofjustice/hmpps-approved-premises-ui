import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { AppealFormData, ChangeRequestReason } from '@approved-premises/ui'
import { DateFormats } from '../../utils/dateUtils'
import { appealReasonRadioDefinitions } from '../../utils/placements/changeRequests'

export default Factory.define<AppealFormData>(() => {
  const approvalDate = faker.date.recent({ days: 5 })
  const appealReason = faker.helpers.arrayElement(Object.keys(appealReasonRadioDefinitions)) as ChangeRequestReason
  const appealReasonDetails = { [`${appealReason}Detail`]: faker.lorem.lines(3) }
  return {
    areaManagerName: faker.person.fullName(),
    areaManagerEmail: faker.internet.email(),
    appealReason,
    notes: faker.lorem.lines(3),
    approvalDate: DateFormats.dateObjToIsoDate(approvalDate),
    ...DateFormats.dateObjectToDateInputs(approvalDate, 'approvalDate'),
    ...appealReasonDetails,
  }
})

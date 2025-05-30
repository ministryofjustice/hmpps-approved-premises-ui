import { Cas1ChangeRequest, Cas1ChangeRequestType, Unit } from '@approved-premises/api'
import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { AppealJson } from '@approved-premises/ui'
import { DateFormats } from '../../utils/dateUtils'
import { appealReasonRadioDefinitions } from '../../utils/placements/changeRequests'

class Cas1ChangeRequestFactory extends Factory<Cas1ChangeRequest> {
  placementAppeal() {
    const appealReason: string = faker.helpers.arrayElement(Object.keys(appealReasonRadioDefinitions))
    const requestJson: AppealJson<string> = {
      areaManagerName: faker.person.fullName(),
      areaManagerEmail: faker.internet.email(),
      appealReason,
      notes: faker.lorem.lines(2),
      approvalDate: DateFormats.dateObjToIsoDate(faker.date.recent({ days: 2 })),
      [`${appealReason}Detail`]: faker.lorem.lines(2),
    }
    return this.params({
      type: 'placementAppeal',
      requestJson: JSON.stringify(requestJson) as unknown as Unit,
    })
  }
}

export default Cas1ChangeRequestFactory.define(({ params }) => {
  return {
    id: faker.string.uuid(),
    type: faker.helpers.arrayElement([
      'placementAppeal',
      'placementExtension',
      'plannedTransfer',
    ]) as Cas1ChangeRequestType,
    createdAt: DateFormats.dateObjToIsoDateTime(faker.date.recent()),
    requestReason: {
      name: faker.helpers.arrayElement(Object.keys(appealReasonRadioDefinitions)),
      id: faker.string.uuid(),
    },
    decision: faker.helpers.arrayElement(['approved', 'rejected']),
    decisionJson: {},
    requestJson: {},
    rejectionReason: {
      name: faker.helpers.arrayElement(Object.keys(appealReasonRadioDefinitions)),
      id: faker.string.uuid(),
    },
    spaceBookingId: faker.string.uuid(),
    ...params,
  } as Cas1ChangeRequest
})

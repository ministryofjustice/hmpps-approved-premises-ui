/* istanbul ignore file */

import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { ApprovedPremisesAssessment } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'
import applicationFactory from './application'
import userFactory from './user'

class AssessmentFactory extends Factory<ApprovedPremisesAssessment> {
  createdXDaysAgo(days: number) {
    const today = new Date()
    return this.params({
      createdAt: DateFormats.dateObjToIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - days)),
    })
  }

  acceptedAssessment() {
    return this.params({
      data: { 'make-a-decision': { 'make-a-decision': { decision: 'releaseDate' } } },
    })
  }
}

export default AssessmentFactory.define(() => ({
  id: faker.string.uuid(),
  service: 'approved-premises',
  application: applicationFactory.withReleaseDate().build(),
  allocatedToStaffMemberId: faker.string.uuid(),
  allocatedToStaffMember: userFactory.build(),
  schemaVersion: faker.string.uuid(),
  outdatedSchema: false,
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  allocatedAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  submittedAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  decision: faker.helpers.arrayElement(['accepted' as const, 'rejected' as const, undefined]),
  data: {},
  clarificationNotes: [],
  rejectionRationale: faker.lorem.sentence(),
  createdFromAppeal: false,
}))

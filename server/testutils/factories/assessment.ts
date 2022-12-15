import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { ApprovedPremisesAssessment } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'
import applicationFactory from './application'

class AssessmentFactory extends Factory<ApprovedPremisesAssessment> {
  createdXDaysAgo(days: number) {
    const today = new Date()
    return this.params({
      createdAt: DateFormats.dateObjToIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - days)),
    })
  }
}

export default AssessmentFactory.define(() => ({
  id: faker.datatype.uuid(),
  application: applicationFactory.withReleaseDate().build(),
  allocatedToStaffMemberId: faker.datatype.uuid(),
  schemaVersion: faker.datatype.uuid(),
  outdatedSchema: false,
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  allocatedAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  submittedAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  decision: 'accepted' as const,
  data: JSON.parse(faker.datatype.json()),
  clarificationNotes: [],
}))

import { Factory } from 'fishery'
import { ApplicationTimeline, PersonalTimeline, TimelineEvent } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'
import userFactory from './user'
import { fullPersonFactory } from './person'

export const timelineEventFactory = Factory.define<TimelineEvent>(() => ({
  id: faker.string.uuid(),
  occurredAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  type: faker.helpers.arrayElement([
    'approved_premises_application_submitted',
    'approved_premises_application_assessed',
    'approved_premises_booking_made',
    'approved_premises_person_arrived',
    'approved_premises_person_not_arrived',
    'approved_premises_person_departed',
    'approved_premises_booking_not_made',
    'approved_premises_booking_cancelled',
    'approved_premises_booking_changed',
    'approved_premises_application_withdrawn',
    'approved_premises_information_request',
    'application_timeline_note',
    'cas3_person_arrived',
    'cas3_person_departed',
  ] as const),
  content: Math.random() < 0.5 ? faker.lorem.sentences() : undefined,
  createdBy: userFactory.build(),
  associatedUrls: [{ type: 'application', url: faker.internet.url() }],
  triggerSource: 'user',
}))

export const applicationTimelineFactory = Factory.define<ApplicationTimeline>(() => ({
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  id: faker.string.uuid(),
  status: faker.helpers.arrayElement([
    'started',
    'submitted',
    'rejected',
    'awaitingAssesment',
    'unallocatedAssesment',
    'assesmentInProgress',
    'awaitingPlacement',
    'placementAllocated',
    'inapplicable',
    'withdrawn',
    'requestedFurtherInformation',
    'pendingPlacementRequest',
  ] as const),
  createdBy: userFactory.build(),
  timelineEvents: timelineEventFactory.buildList(5),
  isOfflineApplication: faker.datatype.boolean(),
}))

export const personalTimelineFactory = Factory.define<PersonalTimeline>(() => ({
  applications: applicationTimelineFactory.buildList(2),
  person: fullPersonFactory.build(),
}))

export default timelineEventFactory

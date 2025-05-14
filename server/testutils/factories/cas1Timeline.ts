import { Factory } from 'fishery'
import {
  Cas1ApplicationTimeline,
  Cas1PersonalTimeline,
  Cas1TimelineEvent,
  Cas1TimelineEventAssociatedUrl,
  Cas1TimelineEventContentPayload,
  Cas1TimelineEventType,
  Cas1TimelineEventUrlType,
  Cas1TriggerSourceType,
} from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'
import userFactory from './user'
import namedIdFactory from './namedId'
import { fullPersonFactory } from './person'

const cas1TimelineEventTypes: ReadonlyArray<Cas1TimelineEventType> = [
  'application_submitted',
  'application_assessed',
  'booking_made',
  'person_arrived',
  'person_not_arrived',
  'person_departed',
  'booking_not_made',
  'booking_cancelled',
  'booking_changed',
  'booking_keyworker_assigned',
  'application_withdrawn',
  'application_expired',
  'information_request',
  'assessment_appealed',
  'assessment_allocated',
  'placement_application_withdrawn',
  'placement_application_allocated',
  'match_request_withdrawn',
  'request_for_placement_created',
  'request_for_placement_assessed',
  'application_timeline_note',
]

const cas1TriggerSourceTypes: ReadonlyArray<Cas1TriggerSourceType> = ['user', 'system']

export const cas1TimelineEventFactory = Factory.define<Cas1TimelineEvent>(() => ({
  id: faker.string.uuid(),
  type: faker.helpers.arrayElement(cas1TimelineEventTypes),
  occurredAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  content: faker.datatype.boolean() ? faker.lorem.sentences() : undefined,
  createdBy: userFactory.build(),
  payload: cas1TimelineEventContentPayloadFactory.build(),
  associatedUrls: cas1TimelineEventAssociatedUrlFactory.buildList(1, { type: 'application' }),
  triggerSource: faker.helpers.arrayElement(cas1TriggerSourceTypes),
}))

export const cas1TimelineEventContentPayloadFactory = Factory.define<Cas1TimelineEventContentPayload>(() => ({
  type: faker.helpers.arrayElement(cas1TimelineEventTypes),
  premises: namedIdFactory.build(),
}))

const cas1TimelineEventUrlTypes: ReadonlyArray<Cas1TimelineEventUrlType> = [
  'application',
  'booking',
  'assessment',
  'assessmentAppeal',
  'spaceBooking',
]

const cas1TimelineEventAssociatedUrlFactory = Factory.define<Cas1TimelineEventAssociatedUrl>(() => ({
  type: faker.helpers.arrayElement(cas1TimelineEventUrlTypes),
  url: faker.internet.url(),
}))

export const applicationTimelineFactory = Factory.define<Cas1ApplicationTimeline>(() => ({
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
  timelineEvents: cas1TimelineEventFactory.buildList(5),
  isOfflineApplication: faker.datatype.boolean(),
}))

export const personalTimelineFactory = Factory.define<Cas1PersonalTimeline>(() => ({
  applications: applicationTimelineFactory.buildList(2),
  person: fullPersonFactory.build(),
}))

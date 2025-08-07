import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { RequestForPlacement } from '@approved-premises/api'
import placementDatesFactory from './placementDates'
import cas1RequestedPlacementPeriodFactory from './cas1RequestedPlacementPeriod'

export default Factory.define<RequestForPlacement>(() => ({
  id: faker.string.uuid(),
  createdAt: faker.date.past().toISOString(),
  createdByUserId: faker.string.uuid(),
  isWithdrawn: faker.datatype.boolean(),
  placementDates: placementDatesFactory.buildList(faker.number.int({ min: 1, max: 3 })),
  dates: placementDatesFactory.build(),
  status: faker.helpers.arrayElement([
    'request_rejected',
    'request_submitted',
    'awaiting_match',
    'request_withdrawn',
    'placement_booked',
    'person_arrived',
    'person_not_arrived',
    'person_departed',
  ]),
  type: faker.helpers.arrayElement(['automatic', 'manual']),
  requestedPlacementPeriod: cas1RequestedPlacementPeriodFactory.build(),
  document: {
    'request-a-placement': [
      {
        'Why are you requesting a placement?': 'Release directed following parole board or other hearing/decision',
      },
      {
        'Enter the date of decision': 'Wed 24 Apr 2024',
        'Provide relevant information from the direction to release that will impact the placement':
          '****** has now been sentenced and is due to be released on the 25/07/2024.',
      },
      {
        '****.doc': 'result',
      },
      {
        'Have there been any significant events since the application was assessed?':
          'Yes - ***** was sentenced and is now due to be released on the 25/02/2001',
        "Has the person's circumstances changed which affect the planned AP placement?": 'No',
        "Has the person's risk factors changed since the application was assessed?": 'No',
        "Has the person's access or healthcare needs changed since the application was assessed?": 'No',
        "Has the person's location factors changed since the application was assessed?": 'No',
      },
      {
        'Dates of placement': [
          {
            'When will the person arrive?': 'Wed 22 Jan 2025',
            'How long should the Approved Premises placement last?': '12 weeks',
          },
        ],
      },
    ],
  },
  requestReviewedAt: faker.date.past().toISOString(),
  submittedAt: faker.date.past().toISOString(),
  withdrawalReason: faker.helpers.arrayElement([
    'DuplicatePlacementRequest',
    'AlternativeProvisionIdentified',
    'ChangeInCircumstances',
    'ChangeInReleaseDecision',
    'NoCapacityDueToLostBed',
    'NoCapacityDueToPlacementPrioritisation',
    'NoCapacity',
    'ErrorInPlacementRequest',
    'WithdrawnByPP',
    'RelatedApplicationWithdrawn',
    'RelatedPlacementRequestWithdrawn',
    'RelatedPlacementApplicationWithdrawn',
  ]),
  canBeDirectlyWithdrawn: faker.datatype.boolean(),
}))

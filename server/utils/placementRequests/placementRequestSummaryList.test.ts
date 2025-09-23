import { Cas1Application, Cas1PlacementRequestDetail } from '@approved-premises/api'

import {
  applicationFactory,
  cas1PlacementRequestDetailFactory,
  cas1RequestedPlacementPeriodFactory,
} from '../../testutils/factories'
import offlineApplicationFactory from '../../testutils/factories/offlineApplication'
import { placementRequestSummaryList } from './placementRequestSummaryList'
import { apTypeLongLabels } from '../apTypeLabels'
import { summaryListItem } from '../formUtils'

describe('placementRequestSummaryList', () => {
  const application = applicationFactory.build({
    licenceExpiryDate: '2030-11-23',
  })
  const placementRequest = cas1PlacementRequestDetailFactory.build({
    isParole: false,
    releaseType: 'hdc',
    authorisedPlacementPeriod: cas1RequestedPlacementPeriodFactory.build({
      arrival: '2025-10-02',
      duration: 52,
    }),
    essentialCriteria: ['hasTactileFlooring'],
    application,
    notes: 'Test notes',
  })

  const timelineAction = (applicationId: string) => ({
    actions: {
      items: [
        {
          href: `/applications/${applicationId}?tab=timeline`,
          text: 'View timeline',
        },
      ],
    },
  })

  it('should generate the expected summary list', () => {
    expect(placementRequestSummaryList(placementRequest).rows).toEqual([
      summaryListItem('Requested arrival date', 'Thu 2 Oct 2025'),
      summaryListItem('Requested departure date', 'Sun 23 Nov 2025'),
      summaryListItem('Length of stay', '7 weeks, 3 days'),
      summaryListItem('Release type', 'Home detention curfew (HDC)'),
      summaryListItem('Licence expiry date', 'Sat 23 Nov 2030'),
      {
        ...summaryListItem('Type of AP', apTypeLongLabels[placementRequest.type]),
        ...timelineAction(placementRequest.applicationId),
      },
      summaryListItem('Preferred postcode', placementRequest.location),
      summaryListItem('Criteria', '<ul class="govuk-list govuk-list--bullet"><li>Tactile flooring</li></ul>', 'html'),
      summaryListItem('Observations from assessor', 'Test notes', 'textBlock'),
    ])
  })

  it('should display the correct summary for a ROTL', () => {
    const rotlPlacementRequest: Cas1PlacementRequestDetail = { ...placementRequest, releaseType: 'rotl' }

    expect(placementRequestSummaryList(rotlPlacementRequest).rows).toEqual([
      summaryListItem('Requested arrival date', 'Thu 2 Oct 2025'),
      summaryListItem('Requested departure date', 'Sun 23 Nov 2025'),
      summaryListItem('Flexible date', placementRequest.authorisedPlacementPeriod.arrivalFlexible ? 'Yes' : 'No'),
      summaryListItem('Length of stay', '7 weeks, 3 days'),
      summaryListItem('Release type', 'Release on Temporary Licence (ROTL)'),
      summaryListItem('Licence expiry date', 'Sat 23 Nov 2030'),
      {
        ...summaryListItem('Type of AP', apTypeLongLabels[placementRequest.type]),
        ...timelineAction(placementRequest.applicationId),
      },
      summaryListItem('Preferred postcode', placementRequest.location),
      summaryListItem('Criteria', '<ul class="govuk-list govuk-list--bullet"><li>Tactile flooring</li></ul>', 'html'),
      summaryListItem('Observations from assessor', 'Test notes', 'textBlock'),
    ])
  })

  it('should display a ROTL in old format if a legacy PR (isFlexible is undefined)', () => {
    const rotlPlacementRequest: Cas1PlacementRequestDetail = {
      ...placementRequest,
      releaseType: 'rotl',
      authorisedPlacementPeriod: { ...placementRequest.authorisedPlacementPeriod, arrivalFlexible: undefined },
    }

    expect(placementRequestSummaryList(rotlPlacementRequest).rows).toEqual([
      summaryListItem('Requested arrival date', 'Thu 2 Oct 2025'),
      summaryListItem('Requested departure date', 'Sun 23 Nov 2025'),
      summaryListItem('Length of stay', '7 weeks, 3 days'),
      summaryListItem('Release type', 'Release on Temporary Licence (ROTL)'),
      summaryListItem('Licence expiry date', 'Sat 23 Nov 2030'),
      {
        ...summaryListItem('Type of AP', apTypeLongLabels[placementRequest.type]),
        ...timelineAction(placementRequest.applicationId),
      },
      summaryListItem('Preferred postcode', placementRequest.location),
      summaryListItem('Criteria', '<ul class="govuk-list govuk-list--bullet"><li>Tactile flooring</li></ul>', 'html'),
      summaryListItem('Observations from assessor', 'Test notes', 'textBlock'),
    ])
  })

  it('should generate the expected summary list when is withdrawn', () => {
    const isWithdrawn = true
    const withdrawnPlacementRequest = {
      ...placementRequest,
      isWithdrawn,
    }
    expect(placementRequestSummaryList(withdrawnPlacementRequest).rows).toEqual([
      summaryListItem('Requested arrival date', 'Thu 2 Oct 2025'),
      summaryListItem('Requested departure date', 'Sun 23 Nov 2025'),
      summaryListItem('Length of stay', '7 weeks, 3 days'),
      summaryListItem('Release type', 'Home detention curfew (HDC)'),

      summaryListItem('Licence expiry date', 'Sat 23 Nov 2030'),
      {
        ...summaryListItem('Type of AP', apTypeLongLabels[placementRequest.type]),
        ...timelineAction(placementRequest.applicationId),
      },
      summaryListItem('Preferred postcode', placementRequest.location),
      summaryListItem(
        'Status',
        `<strong class="govuk-tag govuk-tag--timeline-tag govuk-tag--red">
        Withdrawn
      </strong>`,
        'html',
      ),
      summaryListItem('Criteria', '<ul class="govuk-list govuk-list--bullet"><li>Tactile flooring</li></ul>', 'html'),
      summaryListItem('Observations from assessor', 'Test notes', 'textBlock'),
    ])
  })

  it(`should generate the expected summary list when placement-request's application is undefined`, () => {
    const undefinedApplication: Cas1Application = undefined
    const placementRequestWithoutLicenceExpiry = {
      ...placementRequest,
      application: undefinedApplication,
    }
    expect(placementRequestSummaryList(placementRequestWithoutLicenceExpiry).rows).toEqual([
      summaryListItem('Requested arrival date', 'Thu 2 Oct 2025'),
      summaryListItem('Requested departure date', 'Sun 23 Nov 2025'),
      summaryListItem('Length of stay', '7 weeks, 3 days'),
      summaryListItem('Release type', 'Home detention curfew (HDC)'),
      summaryListItem('Licence expiry date', ''),
      summaryListItem('Type of AP', apTypeLongLabels[placementRequest.type]),
      summaryListItem('Preferred postcode', placementRequest.location),
      summaryListItem('Criteria', '<ul class="govuk-list govuk-list--bullet"><li>Tactile flooring</li></ul>', 'html'),
      summaryListItem('Observations from assessor', 'Test notes', 'textBlock'),
    ])
  })

  it(`should generate the expected summary list when placement-request's application is not of type ApprovedPremisesApplication`, () => {
    const offlineApplication = offlineApplicationFactory.build()
    const placementRequestWithOfflineApplication = {
      ...placementRequest,
      application: offlineApplication as unknown as Cas1Application,
      applicationId: offlineApplication.id,
    }
    expect(placementRequestSummaryList(placementRequestWithOfflineApplication).rows).toEqual([
      summaryListItem('Requested arrival date', 'Thu 2 Oct 2025'),
      summaryListItem('Requested departure date', 'Sun 23 Nov 2025'),
      summaryListItem('Length of stay', '7 weeks, 3 days'),
      summaryListItem('Release type', 'Home detention curfew (HDC)'),
      summaryListItem('Licence expiry date', ''),
      {
        ...summaryListItem('Type of AP', apTypeLongLabels[placementRequest.type]),
        ...timelineAction(offlineApplication.id),
      },
      summaryListItem('Preferred postcode', placementRequest.location),
      summaryListItem('Criteria', '<ul class="govuk-list govuk-list--bullet"><li>Tactile flooring</li></ul>', 'html'),
      summaryListItem('Observations from assessor', 'Test notes', 'textBlock'),
    ])
  })

  it(`should generate the expected summary list with blank licence expiry date when application's license-expiry date is not set`, () => {
    const noLicenceApplication = applicationFactory.build({
      licenceExpiryDate: undefined,
    })
    const placementRequestWithoutLicenceExpiry = {
      ...placementRequest,
      application: noLicenceApplication,
      applicationId: noLicenceApplication.id,
    }
    expect(placementRequestSummaryList(placementRequestWithoutLicenceExpiry).rows).toEqual([
      summaryListItem('Requested arrival date', 'Thu 2 Oct 2025'),
      summaryListItem('Requested departure date', 'Sun 23 Nov 2025'),
      summaryListItem('Length of stay', '7 weeks, 3 days'),
      summaryListItem('Release type', 'Home detention curfew (HDC)'),
      summaryListItem('Licence expiry date', ''),
      {
        ...summaryListItem('Type of AP', apTypeLongLabels[placementRequest.type]),
        ...timelineAction(placementRequestWithoutLicenceExpiry.applicationId),
      },
      summaryListItem('Preferred postcode', placementRequest.location),
      summaryListItem('Criteria', '<ul class="govuk-list govuk-list--bullet"><li>Tactile flooring</li></ul>', 'html'),
      summaryListItem('Observations from assessor', 'Test notes', 'textBlock'),
    ])
  })

  it('should generate the expected summary list without actions', () => {
    expect(placementRequestSummaryList(placementRequest).rows).toEqual([
      summaryListItem('Requested arrival date', 'Thu 2 Oct 2025'),
      summaryListItem('Requested departure date', 'Sun 23 Nov 2025'),
      summaryListItem('Length of stay', '7 weeks, 3 days'),
      summaryListItem('Release type', 'Home detention curfew (HDC)'),
      summaryListItem('Licence expiry date', 'Sat 23 Nov 2030'),
      {
        ...summaryListItem('Type of AP', apTypeLongLabels[placementRequest.type]),
        ...timelineAction(placementRequest.applicationId),
      },
      summaryListItem('Preferred postcode', placementRequest.location),
      summaryListItem('Criteria', '<ul class="govuk-list govuk-list--bullet"><li>Tactile flooring</li></ul>', 'html'),
      summaryListItem('Observations from assessor', 'Test notes', 'textBlock'),
    ])
  })
})

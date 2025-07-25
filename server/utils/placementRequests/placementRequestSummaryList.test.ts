import { Cas1Application } from '@approved-premises/api'
import { SummaryListItem } from '@approved-premises/ui'
import { applicationFactory, cas1PlacementRequestDetailFactory } from '../../testutils/factories'
import offlineApplicationFactory from '../../testutils/factories/offlineApplication'
import { placementRequestSummaryList } from './placementRequestSummaryList'
import { DateFormats } from '../dateUtils'
import { apTypeLongLabels } from '../apTypeLabels'

describe('placementRequestSummaryList', () => {
  const application = applicationFactory.build({
    licenceExpiryDate: '2030-11-23',
  })
  const placementRequest = cas1PlacementRequestDetailFactory.build({
    releaseType: 'hdc',
    expectedArrival: '2025-10-02',
    duration: 52,
    essentialCriteria: ['hasTactileFlooring'],
    application,
    notes: 'Test notes',
  })

  it('should generate the expected summary list', () => {
    expect(placementRequestSummaryList(placementRequest).rows).toEqual(
      expectedSummaryListItems({
        isWithdrawn: false,
        expectedApplicationId: placementRequest.applicationId,
        expectedLicenceExpiryDate: application.licenceExpiryDate,
        expectedPostcode: placementRequest.location,
      }),
    )
  })

  it('should generate the expected summary list when is withdrawn', () => {
    const isWithdrawn = true
    const withdrawnPlacementRequest = {
      ...placementRequest,
      isWithdrawn,
    }
    expect(placementRequestSummaryList(withdrawnPlacementRequest).rows).toEqual(
      expectedSummaryListItems({
        isWithdrawn,
        expectedApplicationId: placementRequest.applicationId,
        expectedLicenceExpiryDate: application.licenceExpiryDate,
        expectedPostcode: placementRequest.location,
      }),
    )
  })

  it(`should generate the expected summary list when placement-request's application is undefined`, () => {
    const undefinedApplication: Cas1Application = undefined
    const placementRequestWithoutLicenceExpiry = {
      ...placementRequest,
      application: undefinedApplication,
    }
    expect(placementRequestSummaryList(placementRequestWithoutLicenceExpiry).rows).toEqual(
      expectedSummaryListItems({
        isWithdrawn: false,
        expectedApplicationId: undefined,
        expectedLicenceExpiryDate: '',
        expectedPostcode: placementRequest.location,
      }),
    )
  })

  it(`should generate the expected summary list when placement-request's application is not of type ApprovedPremisesApplication`, () => {
    const offlineApplication = offlineApplicationFactory.build()
    const placementRequestWithOfflineApplication = {
      ...placementRequest,
      application: offlineApplication as unknown as Cas1Application,
      applicationId: offlineApplication.id,
    }
    expect(placementRequestSummaryList(placementRequestWithOfflineApplication).rows).toEqual(
      expectedSummaryListItems({
        isWithdrawn: false,
        expectedApplicationId: placementRequestWithOfflineApplication.application.id,
        expectedLicenceExpiryDate: '',
        expectedPostcode: placementRequest.location,
      }),
    )
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
    expect(placementRequestSummaryList(placementRequestWithoutLicenceExpiry).rows).toEqual(
      expectedSummaryListItems({
        isWithdrawn: false,
        expectedApplicationId: placementRequestWithoutLicenceExpiry.application.id,
        expectedLicenceExpiryDate: '',
        expectedPostcode: placementRequest.location,
      }),
    )
  })

  it('should generate the expected summary list without actions', () => {
    expect(placementRequestSummaryList(placementRequest, { showActions: false }).rows).toEqual(
      expectedSummaryListItems({
        isWithdrawn: false,
        expectedApplicationId: undefined,
        expectedLicenceExpiryDate: application.licenceExpiryDate,
        expectedPostcode: placementRequest.location,
      }),
    )
  })

  const expectedSummaryListItems = (options: {
    isWithdrawn: boolean
    expectedApplicationId: string
    expectedLicenceExpiryDate: string
    expectedPostcode: string
  }): Array<SummaryListItem> => {
    const apTypeListItem = generateApTypeListItem(options.expectedApplicationId)
    const rows = [
      {
        key: {
          text: 'Requested arrival date',
        },
        value: {
          text: 'Thu 2 Oct 2025',
        },
      },
      {
        key: {
          text: 'Requested departure date',
        },
        value: {
          text: 'Sun 23 Nov 2025',
        },
      },
      {
        key: {
          text: 'Length of stay',
        },
        value: {
          text: '7 weeks, 3 days',
        },
      },
      {
        key: {
          text: 'Release type',
        },
        value: {
          text: 'Home detention curfew (HDC)',
        },
      },
      {
        key: {
          text: 'Licence expiry date',
        },
        value: {
          text: options.expectedLicenceExpiryDate ? DateFormats.isoDateToUIDate(options.expectedLicenceExpiryDate) : '',
        },
      },
      apTypeListItem,
      {
        key: {
          text: 'Preferred postcode',
        },
        value: {
          text: options.expectedPostcode,
        },
      },
      {
        key: {
          text: 'Essential Criteria',
        },
        value: {
          html: '<ul class="govuk-list govuk-list--bullet"><li>Tactile flooring</li></ul>',
        },
      },
      {
        key: {
          text: 'Desirable Criteria',
        },
        value: {
          html: '<span class="text-grey">None</span>',
        },
      },
      {
        key: {
          text: 'Observations from assessor',
        },
        value: {
          text: 'Test notes',
        },
      },
    ]
    if (options.isWithdrawn) {
      const statusRow = {
        key: {
          text: 'Status',
        },
        value: {
          html: `<strong class="govuk-tag govuk-tag--timeline-tag govuk-tag--red">
        Withdrawn
      </strong>`,
        },
      }
      rows.splice(7, 0, statusRow)
    }
    return rows
  }

  const generateApTypeListItem = (expectedApplicationId: string) => {
    const apTypeListItem = {
      key: {
        text: 'Type of AP',
      },
      value: {
        text: apTypeLongLabels[placementRequest.type],
      },
    }
    if (expectedApplicationId) {
      return {
        ...apTypeListItem,
        actions: {
          items: [
            {
              href: `/applications/${expectedApplicationId}?tab=timeline`,
              text: 'View timeline',
            },
          ],
        },
      }
    }
    return apTypeListItem
  }
})

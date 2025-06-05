import { apTypeLabels } from '../apTypeLabels'
import { ApType, ReleaseTypeOption } from '../../@types/shared'
import { cas1PlacementRequestDetailFactory } from '../../testutils/factories'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { withdrawnStatusTag } from '../applications/utils'
import { DateFormats } from '../dateUtils'
import { placementLength } from '../match'
import { adminSummary, apTypeCell, releaseTypeCell } from './adminSummary'
import paths from '../../paths/apply'

describe('adminSummary', () => {
  const placementRequest = cas1PlacementRequestDetailFactory.build({
    expectedArrival: '2022-01-01',
    duration: 16,
    isParole: false,
  })

  const adminSummaryRows = [
    {
      key: {
        text: 'CRN',
      },
      value: {
        text: placementRequest.person.crn,
      },
    },
    {
      key: {
        text: 'Tier',
      },
      value: {
        text: placementRequest.risks.tier.value?.level,
      },
    },

    {
      key: {
        text: 'Requested Arrival Date',
      },
      value: {
        text: DateFormats.isoDateToUIDate('2022-01-01'),
      },
    },
    {
      key: {
        text: 'Requested Departure Date',
      },
      value: {
        text: DateFormats.isoDateToUIDate('2022-01-17'),
      },
    },
    {
      key: {
        text: 'Length of stay',
      },
      value: {
        text: placementLength(16),
      },
    },
    apTypeCell(placementRequest),
    releaseTypeCell(placementRequest),
  ]

  it('should return a summary of a placement request', () => {
    expect(adminSummary(placementRequest)).toEqual({
      rows: adminSummaryRows,
    })
  })

  it('should return a summary of a parole placement request', () => {
    expect(adminSummary(cas1PlacementRequestDetailFactory.build({ ...placementRequest, isParole: true }))).toEqual({
      rows: [
        ...adminSummaryRows.slice(0, 2),
        {
          key: {
            text: 'Estimated arrival date',
          },
          value: {
            text: DateFormats.isoDateToUIDate('2022-01-01'),
          },
        },
        ...adminSummaryRows.slice(3),
      ],
    })
  })

  it('should return N/A if there is no tier', () => {
    expect(
      adminSummary(
        cas1PlacementRequestDetailFactory.build({
          ...placementRequest,
          risks: undefined,
        }),
      ),
    ).toEqual({
      rows: [
        ...adminSummaryRows.slice(0, 1),
        {
          key: {
            text: 'Tier',
          },
          value: {
            text: 'N/A',
          },
        },
        ...adminSummaryRows.slice(2),
      ],
    })
  })

  it('should return a status if the placement request has been withdrawn', () => {
    expect(adminSummary(cas1PlacementRequestDetailFactory.build({ ...placementRequest, isWithdrawn: true }))).toEqual({
      rows: [...adminSummaryRows, withdrawnStatusTag],
    })
  })

  describe('apTypeCell', () => {
    it.each(Object.keys(apTypeLabels) as Array<ApType>)(
      'should return the correct type for AP Type %s',
      (apType: ApType) => {
        const placementRequestWithApType = cas1PlacementRequestDetailFactory.build({
          type: apType,
        })

        expect(apTypeCell(placementRequestWithApType)).toEqual({
          key: {
            text: 'Type of AP',
          },
          value: {
            text: apTypeLabels[apType],
          },
          actions: {
            items: [
              {
                href: `${paths.applications.show({ id: placementRequestWithApType.applicationId })}?tab=timeline`,
                text: 'View timeline',
              },
            ],
          },
        })
      },
    )
  })

  describe('releaseTypeCell', () => {
    it.each(Object.keys(allReleaseTypes) as Array<ReleaseTypeOption>)(
      'should return the correct type for release type %s',
      (releaseType: ReleaseTypeOption) => {
        const placementRequestWithReleaseType = cas1PlacementRequestDetailFactory.build({
          releaseType,
        })

        expect(releaseTypeCell(placementRequestWithReleaseType)).toEqual({
          key: {
            text: 'Release Type',
          },
          value: {
            text: allReleaseTypes[releaseType],
          },
        })
      },
    )
  })
})

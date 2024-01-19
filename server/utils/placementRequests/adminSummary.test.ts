import { ApType, ReleaseTypeOption } from '../../@types/shared'
import { placementRequestDetailFactory } from '../../testutils/factories'
import { allApTypes } from '../allAPTypes'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { DateFormats } from '../dateUtils'
import { placementLength } from '../matchUtils'
import { adminSummary, apTypeCell, releaseTypeCell } from './adminSummary'

describe('adminSummary', () => {
  it('should return a summary of a placement request', () => {
    const placementRequest = placementRequestDetailFactory.build({
      expectedArrival: '2022-01-01',
      duration: 16,
      isParole: false,
    })

    expect(adminSummary(placementRequest)).toEqual({
      rows: [
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
      ],
    })
  })

  it('should return a summary of a parole placement request', () => {
    const placementRequest = placementRequestDetailFactory.build({
      expectedArrival: '2022-01-01',
      duration: 16,
      isParole: true,
    })

    expect(adminSummary(placementRequest)).toEqual({
      rows: [
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
            text: 'Date of decision',
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
      ],
    })
  })

  it('should return N/A if there is no tier', () => {
    const placementRequest = placementRequestDetailFactory.build({
      expectedArrival: '2022-01-01',
      duration: 16,
      risks: undefined,
    })

    expect(adminSummary(placementRequest)).toEqual({
      rows: [
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
            text: 'N/A',
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
      ],
    })
  })

  describe('apTypeCell', () => {
    it.each(Object.keys(allApTypes) as Array<ApType>)(
      'should return the correct type for AP Type %s',
      (apType: ApType) => {
        const placementRequest = placementRequestDetailFactory.build({
          type: apType,
        })

        expect(apTypeCell(placementRequest)).toEqual({
          key: {
            text: 'Type of AP',
          },
          value: {
            text: allApTypes[apType],
          },
        })
      },
    )
  })

  describe('releaseTypeCell', () => {
    it.each(Object.keys(allReleaseTypes) as Array<ReleaseTypeOption>)(
      'should return the correct type for release type %s',
      (releaseType: ReleaseTypeOption) => {
        const placementRequest = placementRequestDetailFactory.build({
          releaseType,
        })

        expect(releaseTypeCell(placementRequest)).toEqual({
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

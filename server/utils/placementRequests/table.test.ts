import { add } from 'date-fns'
import { personFactory, placementRequestFactory, tierEnvelopeFactory } from '../../testutils/factories'
import {
  crnCell,
  dueDateCell,
  expectedArrivalDateCell,
  mapPlacementRequestToBedSearchParams,
  nameCell,
  releaseTypeCell,
  tableRows,
  tierCell,
} from './table'
import { createQueryString } from '../utils'
import paths from '../../paths/match'
import { tierBadge } from '../personUtils'
import { DateFormats } from '../dateUtils'
import { allReleaseTypes } from '../applications/releaseTypeUtils'

describe('tableUtils', () => {
  describe('mapPlacementRequestToBedSearchParams', () => {
    it('transforms a placement request into bed search params', () => {
      const person = personFactory.build()
      const placementRequest = placementRequestFactory.build({
        duration: 12,
        radius: 100,
        person,
      })

      expect(mapPlacementRequestToBedSearchParams(placementRequest)).toEqual({
        durationDays: '12',
        startDate: placementRequest.expectedArrival,
        postcodeDistrict: placementRequest.location,
        maxDistanceMiles: '100',
        crn: person.crn,
        applicationId: placementRequest.applicationId,
        assessmentId: placementRequest.assessmentId,
        requiredCharacteristics: placementRequest.essentialCriteria,
      })
    })
  })

  describe('nameCell', () => {
    it('returns the name of the service user and a link', () => {
      const placementRequest = placementRequestFactory.build()

      expect(nameCell(placementRequest)).toEqual({
        html: `<a data-cy-placementRequestId="${placementRequest.id}" href="${paths.beds.search(
          {},
        )}?${createQueryString(mapPlacementRequestToBedSearchParams(placementRequest))}">${
          placementRequest.person.name
        }</a>`,
      })
    })
  })

  describe('crnCell', () => {
    it('returns the CRN of the service user associated with the placement request', () => {
      const placementRequest = placementRequestFactory.build()

      expect(crnCell(placementRequest)).toEqual({ text: placementRequest.person.crn })
    })
  })

  describe('tierCell', () => {
    it('returns the tier badge for the service user associated with the placement request', () => {
      const tier = tierEnvelopeFactory.build({ value: { level: 'A1' } })
      const placementRequest = placementRequestFactory.build({ risks: { tier } })

      expect(tierCell(placementRequest)).toEqual({ html: tierBadge('A1') })
    })
  })

  describe('expectedArrivalDateCell', () => {
    it('returns a formatted arrival date', () => {
      const placementRequest = placementRequestFactory.build({ expectedArrival: '2022-01-01' })

      expect(expectedArrivalDateCell(placementRequest)).toEqual({
        text: DateFormats.isoDateToUIDate('2022-01-01'),
      })
    })
  })

  describe('dueDateCell', () => {
    it('returns the difference in days between the arrival date and the due date', () => {
      const arrivalDate = add(new Date(), { days: 14 })
      const placementRequest = placementRequestFactory.build({
        expectedArrival: DateFormats.dateObjToIsoDate(arrivalDate),
      })

      expect(dueDateCell(placementRequest, 7)).toEqual({
        text: '7 days',
      })
    })
  })

  describe('releaseTypeCell', () => {
    it('returns the release type', () => {
      const placementRequest = placementRequestFactory.build({ releaseType: 'rotl' })

      expect(releaseTypeCell(placementRequest)).toEqual({ text: allReleaseTypes.rotl })
    })
  })

  describe('tableRows', () => {
    it('returns table rows for placement requests', () => {
      const placementRequest = placementRequestFactory.build()

      expect(tableRows([placementRequest])).toEqual([
        [
          nameCell(placementRequest),
          crnCell(placementRequest),
          tierCell(placementRequest),
          expectedArrivalDateCell(placementRequest),
          dueDateCell(placementRequest, 7),
          releaseTypeCell(placementRequest),
        ],
      ])
    })
  })
})

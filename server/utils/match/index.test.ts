import type { ApType, Cas1SpaceBookingCharacteristic, FullPerson, PlacementCriteria } from '@approved-premises/api'
import applyPaths from '../../paths/apply'
import {
  cas1PremisesFactory,
  cas1PremisesSearchResultSummaryFactory,
  personFactory,
  placementRequestDetailFactory,
  restrictedPersonFactory,
  spaceSearchResultFactory,
} from '../../testutils/factories'
import { DateFormats } from '../dateUtils'
import {
  addressRow,
  apTypeRow,
  apTypeWithViewTimelineActionRow,
  characteristicsRow,
  distanceRow,
  filterOutAPTypes,
  keyDetails,
  placementLength,
  preferredPostcodeRow,
  premisesAddress,
  requestedOrEstimatedArrivalDateRow,
  requirementsHtmlString,
  spaceBookingConfirmationSummaryListRows,
  startDateObjFromParams,
  summaryCardRows,
} from '.'
import { placementCriteriaLabels } from '../placementCriteriaUtils'
import { apTypeLabels } from '../apTypeLabels'
import { textValue } from '../applications/helpers'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { spaceSearchCriteriaRoomLevelLabels } from './spaceSearch'

jest.mock('../retrieveQuestionResponseFromFormArtifact')

describe('matchUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('premisesAddress', () => {
    it('renders a full premises address', () => {
      const premises = cas1PremisesFactory.build({
        fullAddress: '123 Street Name, Smithtown ',
        postcode: 'M21 0BP',
      })

      expect(premisesAddress(premises)).toEqual('123 Street Name, Smithtown, M21 0BP')
    })

    it('renders a search result premises address', () => {
      const premises = cas1PremisesSearchResultSummaryFactory.build({
        fullAddress: ' 456 Street Name, Smithtown',
        postcode: 'N12 0BP ',
      })

      expect(premisesAddress(premises)).toEqual('456 Street Name, Smithtown, N12 0BP')
    })

    it('renders a search result premises address with no postcode', () => {
      const premises = cas1PremisesSearchResultSummaryFactory.build({
        fullAddress: '123 Street Name, Smithtown',
        postcode: undefined,
      })

      expect(premisesAddress(premises)).toEqual('123 Street Name, Smithtown')
    })
  })

  describe('summaryCardsRow', () => {
    it('calls the correct row functions', () => {
      const postcodeArea = 'HR1 2AF'
      const spaceSearchResult = spaceSearchResultFactory.build()

      expect(summaryCardRows(spaceSearchResult, postcodeArea)).toEqual([
        apTypeRow(spaceSearchResult.premises.apType),
        addressRow(spaceSearchResult),
        distanceRow(spaceSearchResult, postcodeArea),
        characteristicsRow(spaceSearchResult),
      ])
    })
  })

  describe('requestedOrEstimatedArrivalDateRow', () => {
    it('should return Estimated arrival date with date when is parole', () => {
      const arrivalDate = '2024-01-28'
      expect(requestedOrEstimatedArrivalDateRow(true, arrivalDate)).toEqual({
        key: { text: 'Estimated arrival date' },
        value: { text: 'Sun 28 Jan 2024' },
      })
    })

    it('should return Requested arrival date with date when is not parole', () => {
      const arrivalDate = '2024-01-28'
      expect(requestedOrEstimatedArrivalDateRow(false, arrivalDate)).toEqual({
        key: { text: 'Requested arrival date' },
        value: { text: 'Sun 28 Jan 2024' },
      })
    })
  })

  describe('apTypeRow', () => {
    it.each(Object.keys(apTypeLabels) as Array<ApType>)(
      'should return the correct type for AP Type %s',
      (apType: ApType) => {
        const placementRequestWithApType = placementRequestDetailFactory.build({
          type: apType,
        })

        expect(apTypeWithViewTimelineActionRow(placementRequestWithApType)).toEqual({
          key: {
            text: 'Type of AP',
          },
          value: {
            text: apTypeLabels[apType],
          },
          actions: {
            items: [
              {
                href: `${applyPaths.applications.show({ id: placementRequestWithApType.application.id })}?tab=timeline`,
                text: 'View timeline',
              },
            ],
          },
        })
      },
    )

    it('should return the correct type for AP Type normal without actions when placement-request has no application', () => {
      const apType: ApType = 'normal'
      const placementRequestWithApType = placementRequestDetailFactory.build({
        type: apType,
        application: undefined,
      })
      expect(apTypeWithViewTimelineActionRow(placementRequestWithApType)).toEqual({
        key: {
          text: 'Type of AP',
        },
        value: {
          text: apTypeLabels[apType],
        },
      })
    })
  })

  describe('preferredPostcodeRow', () => {
    it('returns preferred postcode', () => {
      const postcode = 'B71'
      expect(preferredPostcodeRow(postcode)).toEqual({
        key: { text: 'Preferred postcode' },
        value: { text: postcode },
      })
    })
  })

  describe('distanceRow', () => {
    const spaceSearchResult = spaceSearchResultFactory.build()
    const postcodeArea = 'HR1 2AF'

    describe('if a postcode area is supplied', () => {
      it('returns the distance from the desired postcode', () => {
        expect(distanceRow(spaceSearchResult, postcodeArea)).toEqual({
          key: { text: 'Distance' },
          value: { text: `${spaceSearchResult.distanceInMiles} miles from ${postcodeArea}` },
        })
      })
    })

    describe('if a postcode area is not supplied', () => {
      it('returns the distance from "the desired location" instead', () => {
        expect(distanceRow(spaceSearchResult)).toEqual({
          key: { text: 'Distance' },
          value: { text: `${spaceSearchResult.distanceInMiles} miles from the desired location` },
        })
      })
    })

    it('returns the distance to one decimal place', () => {
      expect(distanceRow({ ...spaceSearchResult, distanceInMiles: 1.234567 })).toEqual({
        key: { text: 'Distance' },
        value: { text: `1.2 miles from the desired location` },
      })
    })
  })

  describe('startDateFromParams', () => {
    describe('when passed input from date input', () => {
      it('it returns an object with the date in ISO format', () => {
        const date = new Date()
        const dateInput = DateFormats.dateObjectToDateInputs(date, 'startDate')

        expect(startDateObjFromParams({ ...dateInput })).toEqual({
          startDate: DateFormats.dateObjToIsoDate(date),
          ...dateInput,
        })
      })
    })

    describe('when passed input as startDate from params', () => {
      it('it returns an object the date in ISO format and the date parts for a date input', () => {
        const dateInput = DateFormats.dateObjToIsoDate(new Date(2023, 0, 1))

        expect(startDateObjFromParams({ startDate: dateInput })).toEqual({
          startDate: dateInput,
          'startDate-day': '1',
          'startDate-month': '1',
          'startDate-year': '2023',
        })
      })
    })

    describe('when passed an empty strings from date inputs and a startDate', () => {
      it('it returns the startDate ', () => {
        expect(
          startDateObjFromParams({
            startDate: '2023-04-11',
            'startDate-day': '',
            'startDate-month': '',
            'startDate-year': '',
          }),
        ).toEqual({ startDate: '2023-04-11', 'startDate-day': '11', 'startDate-month': '4', 'startDate-year': '2023' })
      })
    })
  })

  describe('placementLength', () => {
    it('formats the number of days as weeks', () => {
      expect(placementLength(16)).toEqual('2 weeks, 2 days')
    })
  })

  describe('spaceBookingConfirmationSummaryListRows', () => {
    it('returns summary list items for the space booking confirmation screen', () => {
      const placementRequest = placementRequestDetailFactory.build()
      const premises = cas1PremisesFactory.build()
      const arrivalDate = '2025-05-23'
      const departureDate = '2025-07-18'
      const criteria: Array<Cas1SpaceBookingCharacteristic> = ['hasEnSuite', 'isArsonSuitable']

      expect(
        spaceBookingConfirmationSummaryListRows(placementRequest, premises, arrivalDate, departureDate, criteria),
      ).toEqual([
        { key: { text: 'Approved Premises' }, value: { text: premises.name } },
        { key: { text: 'Address' }, value: { text: `${premises.fullAddress}, ${premises.postcode}` } },
        {
          key: { text: 'Space type' },
          value: {
            html: '<ul class="govuk-list govuk-list--bullet"><li>En-suite bathroom</li><li>Arson offences</li></ul>',
          },
        },
        { key: { text: 'Arrival date' }, value: { text: 'Fri 23 May 2025' } },
        { key: { text: 'Departure date' }, value: { text: 'Fri 18 Jul 2025' } },
        { key: { text: 'Length of stay' }, value: { text: '8 weeks' } },
        { key: { text: 'Release type' }, value: { text: allReleaseTypes[placementRequest.releaseType] } },
      ])
    })
  })

  describe('filterOutAPTypes', () => {
    it('should exclude requirements related to premises type', () => {
      const requirements: Array<PlacementCriteria> = [
        'isPIPE',
        'isESAP',
        'isMHAPStJosephs',
        'isRecoveryFocussed',
        'hasBrailleSignage',
        'hasTactileFlooring',
        'hasHearingLoop',
      ]
      const expected = ['hasBrailleSignage', 'hasTactileFlooring', 'hasHearingLoop']

      expect(filterOutAPTypes(requirements)).toEqual(expected)
    })
  })

  describe('requirementsHtmlString', () => {
    const placementRequest = placementRequestDetailFactory.build({
      essentialCriteria: ['hasBrailleSignage', 'hasHearingLoop', 'isStepFreeDesignated'],
      desirableCriteria: ['isArsonDesignated'],
    })

    it('should return HTML lists of the given requirements', () => {
      expect(requirementsHtmlString(placementRequest.essentialCriteria)).toMatchStringIgnoringWhitespace(`
        <ul class="govuk-list govuk-list--bullet">
          <li>${placementCriteriaLabels.isStepFreeDesignated}</li>
          <li>${placementCriteriaLabels.hasBrailleSignage}</li>
          <li>${placementCriteriaLabels.hasHearingLoop}</li>
        </ul>
      `)
      expect(requirementsHtmlString(placementRequest.desirableCriteria)).toMatchStringIgnoringWhitespace(`
        <ul class="govuk-list govuk-list--bullet">
          <li>${placementCriteriaLabels.isArsonDesignated}</li>
        </ul>
      `)
    })

    it('should only render requirements that exist in the provided labels', () => {
      const result = requirementsHtmlString(placementRequest.essentialCriteria, spaceSearchCriteriaRoomLevelLabels)

      expect(result).toMatchStringIgnoringWhitespace(`
        <ul class="govuk-list govuk-list--bullet">
          <li>${spaceSearchCriteriaRoomLevelLabels.isStepFreeDesignated}</li>
        </ul>
      `)
    })
  })

  describe('keyDetails', () => {
    it('should return the key details for a placement request', () => {
      const person = personFactory.build({ type: 'FullPerson' })
      const placementRequest = placementRequestDetailFactory.build({ person })

      const details = keyDetails(placementRequest)

      expect(details).toEqual({
        header: {
          key: 'Name',
          value: (placementRequest.person as FullPerson).name,
          showKey: false,
        },
        items: [
          {
            key: textValue('CRN'),
            value: textValue(placementRequest.person.crn),
          },
          {
            key: textValue('Tier'),
            value: textValue(placementRequest?.risks?.tier?.value?.level || 'Not available'),
          },
          {
            key: textValue('Date of birth'),
            value: textValue(
              DateFormats.isoDateToUIDate((placementRequest.person as FullPerson).dateOfBirth, { format: 'short' }),
            ),
          },
        ],
      })
    })

    it('should throw an error if the person is not a full person', () => {
      const restrictedPerson = restrictedPersonFactory.build()
      const placementRequest = placementRequestDetailFactory.build()
      placementRequest.person = restrictedPerson

      expect(() => keyDetails(placementRequest)).toThrow('Restricted person')
    })
  })
})

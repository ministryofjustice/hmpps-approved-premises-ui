import type { ApType, Cas1SpaceBookingCharacteristic, FullPerson, PlacementCriteria } from '@approved-premises/api'
import applyPaths from '../../paths/apply'
import matchPaths from '../../paths/match'
import {
  cas1PremisesFactory,
  cas1PremisesSearchResultSummaryFactory,
  cas1SpaceBookingFactory,
  personFactory,
  cas1PlacementRequestDetailFactory,
  restrictedPersonFactory,
  spaceSearchResultFactory,
} from '../../testutils/factories'
import { DateFormats } from '../dateUtils'
import {
  addressRow,
  apTypeRow,
  apTypeWithViewTimelineActionRow,
  characteristicsRow,
  creationNotificationBody,
  distanceRow,
  filterOutAPTypes,
  keyDetails,
  placementLength,
  preferredPostcodeRow,
  premisesAddress,
  requestedOrEstimatedArrivalDateRow,
  spaceBookingConfirmationSummaryListRows,
  spaceSearchResultsCards,
  startDateObjFromParams,
  summaryCardRows,
} from '.'
import { apTypeLongLabels } from '../apTypeLabels'
import { textValue } from '../applications/helpers'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { displayName } from '../personUtils'
import { summaryListItem } from '../formUtils'

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
    const postcodeArea = 'HR1 2AF'
    const spaceSearchResult = spaceSearchResultFactory.build()

    it('calls the correct row functions', () => {
      expect(summaryCardRows(spaceSearchResult, postcodeArea)).toEqual([
        apTypeRow(spaceSearchResult.premises.apType),
        summaryListItem('AP area', spaceSearchResult.premises.apArea.name),
        addressRow(spaceSearchResult),
        distanceRow(spaceSearchResult, postcodeArea),
        characteristicsRow(spaceSearchResult),
      ])
    })

    it('does not return the ap area row if the placement request is for a womens AP', () => {
      expect(summaryCardRows(spaceSearchResult, postcodeArea, true)).toEqual([
        apTypeRow(spaceSearchResult.premises.apType),
        addressRow(spaceSearchResult),
        distanceRow(spaceSearchResult, postcodeArea),
        characteristicsRow(spaceSearchResult),
      ])
    })
  })

  describe('spaceSearchResultsCards', () => {
    const placementRequest = cas1PlacementRequestDetailFactory.build()
    const postcodeArea = 'HR1 2AF'
    const spaceSearchResults = spaceSearchResultFactory.buildList(1)

    it('renders a list of space search results as summary lists with cards', () => {
      const resultCards = spaceSearchResultsCards(placementRequest, postcodeArea, spaceSearchResults)

      expect(resultCards).toEqual([
        {
          card: {
            actions: {
              items: [
                {
                  href: matchPaths.v2Match.placementRequests.search.occupancy({
                    id: placementRequest.id,
                    premisesId: spaceSearchResults[0].premises.id,
                  }),
                  text: 'View spaces',
                  visuallyHiddenText: `View spaces at ${spaceSearchResults[0].premises.name}`,
                },
              ],
            },
            title: { headingLevel: '3', text: spaceSearchResults[0].premises.name },
          },
          rows: summaryCardRows(spaceSearchResults[0], postcodeArea),
        },
      ])
    })

    it('does not contain the AP area row if the placement request is for a womens AP', () => {
      placementRequest.application.isWomensApplication = true
      const resultCards = spaceSearchResultsCards(placementRequest, postcodeArea, spaceSearchResults)

      expect(resultCards[0].rows).toEqual(summaryCardRows(spaceSearchResults[0], postcodeArea, true))
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
    it.each(Object.keys(apTypeLongLabels) as Array<ApType>)(
      'should return the correct type for AP Type %s',
      (apType: ApType) => {
        const placementRequestWithApType = cas1PlacementRequestDetailFactory.build({
          type: apType,
        })

        expect(apTypeWithViewTimelineActionRow(placementRequestWithApType)).toEqual({
          key: {
            text: 'Type of AP',
          },
          value: {
            text: apTypeLongLabels[apType],
          },
          actions: {
            items: [
              {
                href: `${applyPaths.applications.show({ id: placementRequestWithApType.applicationId })}?tab=timeline`,
                text: 'View timeline',
              },
            ],
          },
        })
      },
    )

    it('should return the correct type for AP Type normal without actions when placement-request has no application', () => {
      const apType: ApType = 'normal'
      const placementRequestWithApType = cas1PlacementRequestDetailFactory.build({
        type: apType,
        application: undefined,
      })
      expect(apTypeWithViewTimelineActionRow(placementRequestWithApType)).toEqual({
        key: {
          text: 'Type of AP',
        },
        value: {
          text: apTypeLongLabels[apType],
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
    const placementRequest = cas1PlacementRequestDetailFactory.build()
    const premises = cas1PremisesFactory.build()
    const expectedArrivalDate = '2025-09-23'
    const expectedDepartureDate = '2025-11-18'
    const criteria: Array<Cas1SpaceBookingCharacteristic> = ['hasEnSuite', 'isArsonSuitable']

    it('returns summary list items for the space booking confirmation screen', () => {
      expect(
        spaceBookingConfirmationSummaryListRows({
          premises,
          expectedArrivalDate,
          expectedDepartureDate,
          criteria,
          releaseType: placementRequest.releaseType,
        }),
      ).toEqual([
        { key: { text: 'Approved Premises' }, value: { text: premises.name } },
        { key: { text: 'Address' }, value: { text: `${premises.fullAddress}, ${premises.postcode}` } },
        {
          key: { text: 'Room criteria' },
          value: {
            html: '<ul class="govuk-list govuk-list--bullet"><li>En-suite bathroom</li><li>Suitable for active arson risk</li></ul>',
          },
        },
        { key: { text: 'Expected arrival date' }, value: { text: 'Tue 23 Sep 2025' } },
        { key: { text: 'Expected departure date' }, value: { text: 'Tue 18 Nov 2025' } },
        { key: { text: 'Length of stay' }, value: { text: '8 weeks' } },
        { key: { text: 'Release type' }, value: { text: allReleaseTypes[placementRequest.releaseType] } },
      ])
    })

    it('returns summary list items with no release type for the space booking confirmation screen', () => {
      const rows = spaceBookingConfirmationSummaryListRows({
        premises,
        expectedArrivalDate,
        expectedDepartureDate,
        criteria,
      })

      expect(rows).toHaveLength(6)
      expect(rows).toEqual(expect.not.arrayContaining([expect.objectContaining({ key: { text: 'Release type' } })]))
    })

    it('returns summary list items with the actual arrival date instead if one is provided and adjusts the length of stay accordingly', () => {
      const rows = spaceBookingConfirmationSummaryListRows({
        premises,
        expectedArrivalDate,
        expectedDepartureDate,
        criteria,
        releaseType: placementRequest.releaseType,
        actualArrivalDate: '2025-04-25',
      })

      expect(rows).toHaveLength(7)
      expect(rows).toEqual(
        expect.arrayContaining([
          { key: { text: 'Actual arrival date' }, value: { text: 'Fri 25 Apr 2025' } },
          { key: { text: 'Length of stay' }, value: { text: '8 weeks' } },
        ]),
      )
      expect(rows).toEqual(
        expect.not.arrayContaining([{ key: { text: 'Arrival date' }, value: { text: 'Fri 23 May 2025' } }]),
      )
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

  describe('keyDetails', () => {
    it('should return the key details for a placement request', () => {
      const person = personFactory.build({ type: 'FullPerson' })
      const placementRequest = cas1PlacementRequestDetailFactory.build({ person })

      const details = keyDetails(placementRequest)

      expect(details).toEqual({
        header: {
          key: 'Name',
          value: displayName(placementRequest.person),
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
      const placementRequest = cas1PlacementRequestDetailFactory.build()
      placementRequest.person = restrictedPerson

      expect(() => keyDetails(placementRequest)).toThrow('Restricted person')
    })
  })

  describe('creationNotificationBody', () => {
    it('Should build the notification body', () => {
      const placementRequest = cas1PlacementRequestDetailFactory.build()
      const placement = cas1SpaceBookingFactory.build()
      expect(creationNotificationBody(placement, placementRequest))
        .toEqual(`<ul><li><strong>Approved Premises:</strong> ${placement.premises.name}</li>
<li><strong>Date of application:</strong> ${DateFormats.isoDateToUIDate(placementRequest.applicationDate, { format: 'short' })}</li></ul>
<p>A confirmation email will be sent to the AP and probation practitioner.</p>`)
    })
  })
})

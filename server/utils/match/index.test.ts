import type {
  ApType,
  ApprovedPremisesApplication,
  Cas1SpaceBookingCharacteristic,
  FullPerson,
  PlacementCriteria,
} from '@approved-premises/api'
import { when } from 'jest-when'
import applyPaths from '../../paths/apply'
import paths from '../../paths/match'
import {
  cas1PremisesFactory,
  personFactory,
  placementRequestDetailFactory,
  premisesFactory,
  restrictedPersonFactory,
  spaceSearchParametersUiFactory,
  spaceSearchResultFactory,
} from '../../testutils/factories'
import { DateFormats } from '../dateUtils'
import {
  addressRow,
  apTypeLabelsForRadioInput,
  apTypeRow,
  apTypeWithViewTimelineActionRow,
  arrivalDateRow,
  calculateDepartureDate,
  characteristicsRow,
  checkBoxesForCriteria,
  confirmationSummaryCardRows,
  departureDateRow,
  desirableCharacteristicsRow,
  distanceRow,
  essentialCharacteristicsRow,
  filterOutAPTypes,
  filterToSpaceBookingCharacteristics,
  genderRow,
  groupedCheckboxes,
  groupedCriteria,
  keyDetails,
  lengthOfStayRow,
  mapUiParamsForApi,
  occupancyViewLink,
  placementLength,
  placementLengthRow,
  placementRequestSummaryListForMatching,
  preferredPostcodeRow,
  premisesNameRow,
  redirectToSpaceBookingsNew,
  requestedOrEstimatedArrivalDateRow,
  requirementsHtmlString,
  spaceBookingConfirmationSummaryListRows,
  spaceBookingPersonNeedsSummaryCardRows,
  spaceBookingPremisesSummaryCardRows,
  startDateObjFromParams,
  summaryCardRows,
} from '.'
import { placementCriteriaLabels } from '../placementCriteriaUtils'
import * as formUtils from '../formUtils'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import PreferredAps from '../../form-pages/apply/risk-and-need-factors/location-factors/preferredAps'
import { apTypeLabels } from '../apTypeLabels'
import { textValue } from '../applications/helpers'
import { preferredApsRow } from '../placementRequests/preferredApsRow'
import { placementRequirementsRow } from '../placementRequests/placementRequirementsRow'
import { allReleaseTypes } from '../applications/releaseTypeUtils'

jest.mock('../retrieveQuestionResponseFromFormArtifact')

describe('matchUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('mapUiParamsForApi', () => {
    it('converts string properties to numbers', () => {
      const uiParams = spaceSearchParametersUiFactory.build()

      expect(mapUiParamsForApi(uiParams)).toEqual({
        durationInDays: Number(uiParams.durationInDays),
        requirements: {
          apTypes: [uiParams.requirements.apType],
          spaceCharacteristics: uiParams.requirements.spaceCharacteristics,
        },
        applicationId: uiParams.applicationId,
        startDate: uiParams.startDate,
        targetPostcodeDistrict: uiParams.targetPostcodeDistrict,
      })
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

  describe('checkBoxesForCriteria', () => {
    it('returns an array of checkboxes with the selectedValues selected and any empty values removed', () => {
      const options = {
        isESAP: 'ESAP',
        isIAP: 'IAP',
        isSemiSpecialistMentalHealth: 'Semi specialist mental health',
      }
      const result = checkBoxesForCriteria(options, ['isESAP', 'isIAP'])

      expect(result).toEqual([
        {
          checked: true,
          id: 'isESAP',
          text: 'ESAP',
          value: 'isESAP',
        },
        { text: 'IAP', value: 'isIAP', id: 'isIAP', checked: true },
        {
          checked: false,
          id: 'isSemiSpecialistMentalHealth',
          text: 'Semi specialist mental health',
          value: 'isSemiSpecialistMentalHealth',
        },
      ])
    })
  })

  describe('groupedCheckboxes', () => {
    it('returns checkboxes grouped by category', () => {
      expect(groupedCheckboxes()).toEqual({
        'AP requirements': {
          inputName: 'spaceCharacteristics',
          items: groupedCriteria.offenceAndRisk.items,
        },
        'Room requirements': {
          inputName: 'spaceCharacteristics',
          items: groupedCriteria.accessNeeds.items,
        },
      })
    })
  })

  describe('placementLength', () => {
    it('formats the number of days as weeks', () => {
      expect(placementLength(16)).toEqual('2 weeks, 2 days')
    })
  })

  describe('occupancyViewLink', () => {
    it('returns a link to the occupancy view page', () => {
      const placementRequestId = '123'
      const premisesId = 'abc'
      const startDate = '2025-04-14'
      const durationDays = '84'
      const spaceCharacteristics: Array<Cas1SpaceBookingCharacteristic> = ['isWheelchairDesignated', 'isSingle']

      const result = occupancyViewLink({
        placementRequestId,
        premisesId,
        startDate,
        durationDays,
        spaceCharacteristics,
      })

      expect(result).toEqual(
        `${paths.v2Match.placementRequests.search.occupancy({
          id: placementRequestId,
          premisesId,
        })}?startDate=2025-04-14&durationDays=84&criteria=isWheelchairDesignated&criteria=isSingle`,
      )
    })

    it('filters out non booking-specific search criteria', () => {
      const placementRequestId = '123'
      const premisesId = 'abc'
      const startDate = '2025-04-14'
      const durationDays = '84'
      const spaceCharacteristics: Array<PlacementCriteria> = [
        'isPIPE',
        'isESAP',
        'isMHAPStJosephs',
        'isMHAPElliottHouse',
        'isSemiSpecialistMentalHealth',
        'isRecoveryFocussed',
        'isWheelchairDesignated',
        'isSingle',
        'hasEnSuite',
        'isArsonSuitable',
      ]

      const result = occupancyViewLink({
        placementRequestId,
        premisesId,
        startDate,
        durationDays,
        spaceCharacteristics: filterToSpaceBookingCharacteristics(spaceCharacteristics),
      })

      expect(result).toEqual(
        `${paths.v2Match.placementRequests.search.occupancy({
          id: placementRequestId,
          premisesId,
        })}?startDate=2025-04-14&durationDays=84&criteria=isWheelchairDesignated&criteria=isSingle&criteria=hasEnSuite&criteria=isArsonSuitable`,
      )
    })
  })

  describe('redirectToSpaceBookingsNew', () => {
    it('returns a link to the confirm booking page with dates, criteria and existing query parameters', () => {
      const placementRequestId = '123'
      const premisesId = 'abc'
      const arrivalDate = '2022-01-01'
      const departureDate = '2022-03-05'
      const criteria: Array<Cas1SpaceBookingCharacteristic> = ['hasEnSuite', 'isWheelchairDesignated']
      const existingQuery = {
        foo: 'bar',
      }

      const result = redirectToSpaceBookingsNew({
        placementRequestId,
        premisesId,
        arrivalDate,
        departureDate,
        criteria,
        ...existingQuery,
      })
      const expectedQueryString =
        'arrivalDate=2022-01-01&departureDate=2022-03-05&criteria=hasEnSuite&criteria=isWheelchairDesignated&foo=bar'

      expect(result).toEqual(
        `${paths.v2Match.placementRequests.spaceBookings.new({
          id: placementRequestId,
          premisesId,
        })}?${expectedQueryString}`,
      )
    })
  })

  describe('confirmationSummaryCardRows', () => {
    it('should call the correct row functions', () => {
      const spaceSearchResult = spaceSearchResultFactory.build()
      const dates = {
        startDate: '2022-01-01',
        endDate: '2022-01-15',
        placementLength: 2,
      }

      expect(confirmationSummaryCardRows(spaceSearchResult, dates)).toEqual([
        premisesNameRow(spaceSearchResult.premises.name),
        arrivalDateRow(dates.startDate),
        departureDateRow(dates.endDate),
        placementLengthRow(dates.placementLength),
      ])
    })
  })

  describe('spaceBookingPersonNeedsSummaryCardRows', () => {
    it('should call the correct row functions', () => {
      const gender = 'male'

      const dates = {
        startDate: '2022-01-01',
        endDate: '2022-01-15',
        placementLength: 2,
      }
      const essentialCharacteristics: Array<PlacementCriteria> = ['hasTactileFlooring']
      const desirableCharacteristics: Array<PlacementCriteria> = ['hasBrailleSignage']

      expect(
        spaceBookingPersonNeedsSummaryCardRows(dates, gender, essentialCharacteristics, desirableCharacteristics),
      ).toEqual([
        arrivalDateRow(dates.startDate),
        departureDateRow(dates.endDate),
        placementLengthRow(dates.placementLength),
        genderRow(gender),
        essentialCharacteristicsRow(essentialCharacteristics),
        desirableCharacteristicsRow(desirableCharacteristics),
      ])
    })
  })

  describe('spaceBookingPremisesSummaryCardRows', () => {
    it('should call the correct row functions', () => {
      const premisesName = 'Hope House'
      const apType = 'pipe'

      expect(spaceBookingPremisesSummaryCardRows(premisesName, apType)).toEqual([
        premisesNameRow(premisesName),
        apTypeRow(apType),
      ])
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
        { key: { text: 'Address' }, value: { text: premises.fullAddress } },
        {
          key: { text: 'Space type' },
          value: { html: '<ul class="govuk-list"><li>En-suite bathroom</li><li>Arson offences</li></ul>' },
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
    it('should return correctly formatted HTML strings for essential and desirable criteria', () => {
      const placementRequest = placementRequestDetailFactory.build({
        essentialCriteria: ['hasHearingLoop', 'isStepFreeDesignated'],
        desirableCriteria: ['isArsonDesignated'],
      })

      expect(requirementsHtmlString(placementRequest.essentialCriteria)).toEqual(
        `<ul class="govuk-list"><li>${placementCriteriaLabels.hasHearingLoop}</li><li>${placementCriteriaLabels.isStepFreeDesignated}</li></ul>`,
      )
      expect(requirementsHtmlString(placementRequest.desirableCriteria)).toEqual(
        `<ul class="govuk-list"><li>${placementCriteriaLabels.isArsonDesignated}</li></ul>`,
      )
    })
  })

  describe('apTypeLabelsForRadioInput', () => {
    it('calls the function to create the radio items with the expected arguments', () => {
      const radioButtonUtilSpy = jest.spyOn(formUtils, 'convertKeyValuePairToRadioItems')

      const apType: ApType = 'esap'

      const result = apTypeLabelsForRadioInput(apType)

      expect(result).toEqual([
        {
          checked: false,
          conditional: undefined,
          hint: undefined,
          text: 'Standard AP',
          value: 'normal',
        },
        { divider: 'or' },
        {
          checked: false,
          conditional: undefined,
          hint: undefined,
          text: 'Psychologically Informed Planned Environment (PIPE)',
          value: 'pipe',
        },
        {
          checked: true,
          conditional: undefined,
          hint: undefined,
          text: 'Enhanced Security AP (ESAP)',
          value: 'esap',
        },
        {
          checked: false,
          conditional: undefined,
          hint: undefined,
          text: 'Recovery Focused AP (RFAP)',
          value: 'rfap',
        },
        {
          checked: false,
          conditional: undefined,
          hint: undefined,
          text: 'Specialist Mental Health AP (Elliott House - Midlands)',
          value: 'mhapElliottHouse',
        },
        {
          checked: false,
          conditional: undefined,
          hint: undefined,
          text: 'Specialist Mental Health AP (St Josephs - Greater Manchester)',
          value: 'mhapStJosephs',
        },
      ])
      expect(radioButtonUtilSpy).toHaveBeenCalledWith(apTypeLabels, apType)
    })
  })

  describe('placementRequestSummaryListForMatching', () => {
    it('returns the rows for a placement request', () => {
      const placementRequest = placementRequestDetailFactory.build()

      expect(placementRequestSummaryListForMatching(placementRequest)).toEqual([
        arrivalDateRow(placementRequest.expectedArrival),
        departureDateRow(
          DateFormats.dateObjToIsoDate(
            calculateDepartureDate(placementRequest.expectedArrival, placementRequest.duration),
          ),
        ),
        lengthOfStayRow(placementRequest.duration),
        preferredPostcodeRow(placementRequest.location),
        apTypeRow(placementRequest.type),
        placementRequirementsRow(placementRequest, 'essential'),
        placementRequirementsRow(placementRequest, 'desirable'),
      ])
    })

    it('adds the preferred APs if they exist', () => {
      const placementRequest = placementRequestDetailFactory.build()
      const preferredAps = premisesFactory.buildList(1)

      when(retrieveOptionalQuestionResponseFromFormArtifact)
        .calledWith(placementRequest.application as ApprovedPremisesApplication, PreferredAps, 'selectedAps')
        .mockReturnValue(preferredAps)

      expect(placementRequestSummaryListForMatching(placementRequest)).toEqual(
        expect.arrayContaining([preferredApsRow(placementRequest)]),
      )
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

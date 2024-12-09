import type {
  ApType,
  ApprovedPremisesApplication,
  Cas1SpaceCharacteristic,
  FullPerson,
  PlacementCriteria,
} from '@approved-premises/api'
import { when } from 'jest-when'
import paths from '../../paths/match'
import {
  personFactory,
  placementRequestDetailFactory,
  premisesFactory,
  restrictedPersonFactory,
  spaceSearchParametersUiFactory,
  spaceSearchResultFactory,
} from '../../testutils/factories'
import { DateFormats } from '../dateUtils'
import {
  InvalidSpaceSearchDataException,
  addressRow,
  apTypeLabelsForRadioInput,
  apTypeRow,
  arrivalDateRow,
  calculateDepartureDate,
  characteristicsRow,
  checkBoxesForCriteria,
  confirmationSummaryCardRows,
  decodeSpaceSearchResult,
  departureDateRow,
  desirableCharacteristicsRow,
  distanceRow,
  encodeSpaceSearchResult,
  essentialCharacteristicsRow,
  filterOutAPTypes,
  genderRow,
  groupedCheckboxes,
  groupedCriteria,
  keyDetails,
  lengthOfStayRow,
  mapUiParamsForApi,
  occupancyViewLink,
  occupancyViewSummaryListForMatchingDetails,
  placementLength,
  placementLengthRow,
  placementRequestSummaryListForMatching,
  postcodeRow,
  premisesNameRow,
  redirectToSpaceBookingsNew,
  releaseTypeRow,
  requirementsHtmlString,
  spaceBookingPersonNeedsSummaryCardRows,
  spaceBookingPremisesSummaryCardRows,
  spaceRequirementsRow,
  startDateObjFromParams,
  summaryCardRows,
  totalCapacityRow,
} from '.'
import { placementCriteriaLabels } from '../placementCriteriaUtils'
import { createQueryString } from '../utils'
import * as formUtils from '../formUtils'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import PreferredAps from '../../form-pages/apply/risk-and-need-factors/location-factors/preferredAps'
import { apTypeLabels } from '../apTypeLabels'
import { textValue } from '../applications/helpers'
import { preferredApsRow } from '../placementRequests/preferredApsRow'
import { placementRequirementsRow } from '../placementRequests/placementRequirementsRow'

jest.mock('../utils')
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
          genders: [uiParams.requirements.gender],
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
        'Risks and offences': {
          inputName: 'spaceCharacteristics',
          items: groupedCriteria.offenceAndRisk.items,
        },
        'Access needs and additional features': {
          inputName: 'spaceCharacteristics',
          items: groupedCriteria.accessNeeds.items,
        },
      })
    })
  })

  describe('encodeSpaceSearchResult', () => {
    it('encodes a space search result to Base64', () => {
      const spaceSearchResult = spaceSearchResultFactory.build()

      expect(encodeSpaceSearchResult(spaceSearchResult)).toEqual(
        Buffer.from(JSON.stringify(spaceSearchResult)).toString('base64'),
      )
    })
  })

  describe('decodeSpaceSearchResult', () => {
    it('decodes a Base64 encoded space search result', () => {
      const spaceSearchResult = spaceSearchResultFactory.build()
      const encodedResult = encodeSpaceSearchResult(spaceSearchResult)

      expect(decodeSpaceSearchResult(encodedResult)).toEqual(spaceSearchResult)
    })

    it('throws an error if the object is not a space search result', () => {
      const obj = Buffer.from('{"foo":"bar"}').toString('base64')

      expect(() => decodeSpaceSearchResult(obj)).toThrowError(InvalidSpaceSearchDataException)
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
      const premisesName = 'Hope House'
      const premisesId = 'abc'
      const apType = 'pipe'
      const startDate = '2022-01-01'
      const durationWeeks = '4'
      const durationDays = '1'
      const durationInDays = Number(durationWeeks) * 7 + Number(durationDays)

      const result = occupancyViewLink({
        placementRequestId,
        premisesName,
        premisesId,
        apType,
        startDate,
        durationDays,
      })

      expect(result).toEqual(
        `${paths.v2Match.placementRequests.spaceBookings.viewSpaces({ id: placementRequestId })}${createQueryString(
          {
            premisesName,
            premisesId,
            apType,
            startDate,
            durationInDays,
          },
          { addQueryPrefix: true },
        )}`,
      )
    })
  })

  describe('redirectToSpaceBookingsNew', () => {
    it('returns a link to the confirm page with the premises name and bed', () => {
      const placementRequestId = '123'
      const premisesName = 'Hope House'
      const premisesId = 'abc'
      const apType = 'pipe'
      const startDate = '2022-01-01'
      const durationDays = '1'

      const result = redirectToSpaceBookingsNew({
        placementRequestId,
        premisesName,
        premisesId,
        apType,
        startDate,
        durationDays,
      })

      expect(result).toEqual(
        `${paths.v2Match.placementRequests.spaceBookings.new({ id: placementRequestId })}${createQueryString(
          {
            premisesName,
            premisesId,
            apType,
            startDate,
            durationDays,
          },
          { addQueryPrefix: true },
        )}`,
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

  describe('occupancyViewSummaryListForMatchingDetails', () => {
    const placementRequest = placementRequestDetailFactory.build({ releaseType: 'hdc' })
    const totalCapacity = 120

    const dates = {
      startDate: '2025-10-02',
      endDate: '2025-12-23',
      placementLength: 52,
    }
    const essentialCharacteristics: Array<Cas1SpaceCharacteristic> = ['hasTactileFlooring']

    it('should call the correct row functions', () => {
      expect(
        occupancyViewSummaryListForMatchingDetails(totalCapacity, dates, placementRequest, essentialCharacteristics),
      ).toEqual([
        arrivalDateRow(dates.startDate),
        departureDateRow(dates.endDate),
        placementLengthRow(dates.placementLength),
        releaseTypeRow(placementRequest),
        totalCapacityRow(totalCapacity),
        spaceRequirementsRow(essentialCharacteristics),
      ])
    })

    it('should generate the expected matching details', () => {
      expect(
        occupancyViewSummaryListForMatchingDetails(totalCapacity, dates, placementRequest, essentialCharacteristics),
      ).toEqual([
        {
          key: {
            text: 'Expected arrival date',
          },
          value: {
            text: 'Thu 2 Oct 2025',
          },
        },
        {
          key: {
            text: 'Expected departure date',
          },
          value: {
            text: 'Tue 23 Dec 2025',
          },
        },
        {
          key: {
            text: 'Placement length',
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
            text: 'Total capacity',
          },
          value: {
            text: '120 spaces',
          },
        },
        {
          key: {
            text: 'Space requirements',
          },
          value: {
            html: '<ul class="govuk-list"><li>Tactile flooring</li></ul>',
          },
        },
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
        postcodeRow(placementRequest.location),
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

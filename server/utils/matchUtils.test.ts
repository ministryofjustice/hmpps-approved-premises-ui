import paths from '../paths/match'
import { spaceSearchParametersUiFactory, spaceSearchResultFactory } from '../testutils/factories'
import { placementCriteria } from '../testutils/factories/placementRequest'

import { DateFormats } from './dateUtils'
import {
  InvalidSpaceSearchDataException,
  addressRow,
  apTypeCriteria,
  apTypeRow,
  arrivalDateRow,
  checkBoxesForCriteria,
  confirmationSummaryCardRows,
  decodeSpaceSearchResult,
  departureDateRow,
  distanceRow,
  groupedCheckboxes,
  groupedEssentialCriteria,
  filterPlacementCriteriaToSpaceCharacteristics,
  mapSearchParamCharacteristicsForUi,
  mapUiParamsForApi,
  placementDates,
  placementLength,
  placementLengthRow,
  premisesNameRow,
  startDateObjFromParams,
  summaryCardLink,
  summaryCardRows,
  townRow,
} from './matchUtils'
import { createQueryString } from './utils'

jest.mock('./utils.ts')
jest.mock('./placementCriteriaUtils', () => ({
  specialistApTypeCriteriaLabels: {
    isPIPE: 'Psychologically Informed Planned Environment (PIPE)',
    isESAP: 'Enhanced Security AP (ESAP)',
  },
  placementRequirementCriteriaLabels: {
    isWheelchairDesignated: 'Wheelchair accessible',
    isSingle: 'Single room',
    isStepFreeDesignated: 'Step-free access',
    isCatered: 'Catering required',
    hasEnSuite: 'En-suite bathroom',
    isSuitedForSexOffenders: 'Room suitable for a person with sexual offences',
    isArsonDesignated: 'Designated arson room',
  },
  offenceAndRiskCriteriaLabels: {
    isSuitableForVulnerable: 'Vulnerable to exploitation',
    acceptsSexOffenders: 'Sexual offences against an adult',
    acceptsChildSexOffenders: 'Sexual offences against children',
    acceptsNonSexualChildOffenders: 'Non sexual offences against children',
    acceptsHateCrimeOffenders: 'Hate based offences',
    isArsonSuitable: 'Arson offences',
  },
  placementCriteriaLabels: {
    isPIPE: 'Psychologically Informed Planned Environment (PIPE)',
    isESAP: 'Enhanced Security AP (ESAP)',
    isRecoveryFocussed: 'Recovery Focused Approved Premises (RFAP)',
    isSemiSpecialistMentalHealth: 'Semi-specialist mental health',
    isSuitableForVulnerable: 'Vulnerable to exploitation',
    acceptsSexOffenders: 'Sexual offences against an adult',
    acceptsChildSexOffenders: 'Sexual offences against children',
    acceptsNonSexualChildOffenders: 'Non sexual offences against children',
    acceptsHateCrimeOffenders: 'Hate based offences',
    isWheelchairDesignated: 'Wheelchair accessible',
    isSingle: 'Single room',
    isStepFreeDesignated: 'Step-free access',
    isCatered: 'Catering required',
    hasEnSuite: 'En-suite bathroom',
    isSuitedForSexOffenders: 'Room suitable for a person with sexual offences',
    isArsonSuitable: 'Arson offences',
    hasBrailleSignage: 'Braille signage',
    hasTactileFlooring: 'Tactile flooring',
    hasHearingLoop: 'Hearing loop',
    isArsonDesignated: 'Designated arson room',
  },
}))

describe('matchUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('mapUiParamsForApi', () => {
    it('converts string properties to numbers', () => {
      const uiParams = spaceSearchParametersUiFactory.build({ durationWeeks: '2', durationDays: '1' })

      expect(mapUiParamsForApi(uiParams)).toEqual({
        durationInDays: 15,
        requirements: {
          ...uiParams.requirements,
        },
        startDate: uiParams.startDate,
        targetPostcodeDistrict: uiParams.targetPostcodeDistrict,
      })
    })
  })

  describe('mapSearchParamCharacteristicsForUi', () => {
    it('it returns the search results characteristics names in a list', () => {
      expect(mapSearchParamCharacteristicsForUi(['isPIPE'])).toEqual(
        '<ul class="govuk-list"><li>Psychologically Informed Planned Environment (PIPE)</li></ul>',
      )
    })
  })

  describe('summaryCardsRow', () => {
    it('calls the correct row functions', () => {
      const postcodeArea = 'HR1 2AF'
      const spaceSearchResult = spaceSearchResultFactory.build()

      expect(summaryCardRows(spaceSearchResult, postcodeArea)).toEqual([
        apTypeRow(spaceSearchResult),
        addressRow(spaceSearchResult),
        townRow(spaceSearchResult),
        distanceRow(spaceSearchResult, postcodeArea),
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
        'AP type': { inputName: 'apTypes' },
        'Risks and offences': {
          inputName: 'spaceCharacteristics',
        },
        'AP & room characteristics': {
          inputName: 'spaceCharacteristics',
        },
        Gender: {
          inputName: 'genders',
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

  describe('placementDates', () => {
    it('returns formatted versions of the placement dates and durations', () => {
      const startDate = '2022-01-01'
      const lengthInDays = '4'

      expect(placementDates(startDate, lengthInDays)).toEqual({
        startDate: '2022-01-01',
        endDate: '2022-01-05',
        placementLength: 4,
      })
    })
  })

  describe('summaryCardLink', () => {
    it('returns a link to the confirm page with the premises name and bed', () => {
      const spaceSearchResult = spaceSearchResultFactory.build()
      const placementRequestId = '123'
      const startDate = '2022-01-01'
      const durationWeeks = '4'
      const durationDays = '1'
      const durationInDays = Number(durationWeeks) * 7 + Number(durationDays)

      summaryCardLink({
        spaceSearchResult,
        placementRequestId,
        startDate,
        durationDays,
        durationWeeks,
      })

      expect(
        `${paths.placementRequests.bookings.confirm({ id: placementRequestId })}${createQueryString(
          {
            spaceSearchResult: encodeSpaceSearchResult(spaceSearchResult),
            startDate,
            durationInDays,
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
        premisesNameRow(spaceSearchResult),
        arrivalDateRow(dates.startDate),
        departureDateRow(dates.endDate),
        placementLengthRow(dates.placementLength),
      ])
    })
  })

  describe('filterPlacementCriteriaToSpaceCharacteristics', () => {
    it('removes characteristics related to the AP Type', () => {
      expect(filterPlacementCriteriaToSpaceCharacteristics([...placementCriteria, ...apTypeCriteria])).toEqual(
        expect.arrayContaining([
          'acceptsHateCrimeOffenders',
          'isSuitableForVulnerable',
          'isWheelchairDesignated',
          'isSingle',
          'isStepFreeDesignated',
          'acceptsChildSexOffenders',
          'isCatered',
          'hasEnSuite',
          'isSuitedForSexOffenders',
          'acceptsSexOffenders',
          'acceptsNonSexualChildOffenders',
          'isArsonSuitable',
        ]),
      )
    })
  })
})

import paths from '../paths/match'
import { spaceSearchParametersUiFactory, spaceSearchResultFactory } from '../testutils/factories'
import { placementCriteria } from '../testutils/factories/placementRequest'

import { DateFormats } from './dateUtils'
import {
  InvalidBedSearchDataException,
  additionalCharacteristicsRow,
  addressRow,
  apTypeCriteria,
  arrivalDateRow,
  bedCountRow,
  bedNameRow,
  checkBoxesForCriteria,
  confirmationSummaryCardRows,
  decodeBedSearchResult,
  departureDateRow,
  encodeBedSearchResult,
  groupedCheckboxes,
  groupedEssentialCriteria,
  filterPlacementCriteriaToSpaceCharacteristics,
  mapSearchParamCharacteristicsForUi,
  mapUiParamsForApi,
  matchedCharacteristics,
  matchedCharacteristicsRow,
  placementDates,
  placementLength,
  placementLengthRow,
  premisesNameRow,
  selectedEssentialCriteria,
  startDateObjFromParams,
  summaryCardHeader,
  summaryCardRows,
  townRow,
  unmatchedCharacteristics,
} from './matchUtils'
import {
  offenceAndRiskCriteriaLabels,
  placementCriteriaLabels,
  placementRequirementCriteriaLabels,
  specialistApTypeCriteriaLabels,
} from './placementCriteriaUtils'
import { linkTo } from './utils'

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

  describe('matchedCharacteristics', () => {
    it('returns a list of the matched characteristics', () => {
      const actualCharacteristics = [
        apCharacteristicPairFactory.build({ propertyName: 'isSemiSpecialistMentalHealth' }),
        apCharacteristicPairFactory.build({ propertyName: 'isPIPE' }),
        apCharacteristicPairFactory.build({ propertyName: 'isCatered' }),
      ]
      const requiredCharacteristics = ['isPIPE', 'isCatered']

      expect(matchedCharacteristics(actualCharacteristics, requiredCharacteristics)).toEqual(
        mapSearchParamCharacteristicsForUi(['isPIPE', 'isCatered']),
      )
    })
  })

  describe('unmatchedCharacteristics', () => {
    it('returns a list of the unmatched characteristics', () => {
      const actualCharacteristics = [
        apCharacteristicPairFactory.build({ propertyName: 'isSemiSpecialistMentalHealth' }),
        apCharacteristicPairFactory.build({ propertyName: 'isPIPE' }),
        apCharacteristicPairFactory.build({ propertyName: 'isCatered' }),
      ]
      const requiredCharacteristics = ['isPIPE']

      expect(unmatchedCharacteristics(actualCharacteristics, requiredCharacteristics)).toEqual(
        mapSearchParamCharacteristicsForUi(['isSemiSpecialistMentalHealth', 'isCatered']),
      )
    })
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
      const bedSearchResult = bedSearchResultFactory.build()
      const searchParams = bedSearchParametersFactory.build()
      expect(summaryCardRows(bedSearchResult, searchParams.requiredCharacteristics)).toEqual([
        townRow(bedSearchResult),
        addressRow(bedSearchResult),
        matchedCharacteristicsRow(bedSearchResult, searchParams.requiredCharacteristics),
        additionalCharacteristicsRow(bedSearchResult, searchParams.requiredCharacteristics),
        bedCountRow(bedSearchResult),
      ])
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
      expect(groupedCheckboxes([])).toEqual({
        'Type of AP': checkBoxesForCriteria(specialistApTypeCriteriaLabels, []),
        'Placement Requirements': checkBoxesForCriteria(placementRequirementCriteriaLabels, []),
        'Risks and offences to consider': checkBoxesForCriteria(offenceAndRiskCriteriaLabels, []),
      })
    })
  })

  describe('selectedEssentialCriteria', () => {
    it('returns the translated selected essential criteria as an array', () => {
      const criteria = {
        foo: 'Foo',
        bar: 'Bar',
        baz: 'Baz',
      }
      expect(selectedEssentialCriteria(criteria, ['foo', 'fizz', 'buzz', 'bar'])).toEqual(['Foo', 'Bar'])
    })
  })

  describe('groupedEssentialCriteria', () => {
    it('groups criteria by their category, removing any empty criteria', () => {
      const essentialCriteria = ['isPIPE', 'isRecoveryFocussed', 'isSuitableForVulnerable']

      expect(groupedEssentialCriteria(essentialCriteria)).toEqual({
        'Type of AP': [placementCriteriaLabels.isPIPE],
        'Risks and offences to consider': [placementCriteriaLabels.isSuitableForVulnerable],
      })
    })
  })

  describe('encodeBedSearchResult', () => {
    it('encodes a bed search result to Base64', () => {
      const bedSearchResult = bedSearchResultFactory.build()

      expect(encodeBedSearchResult(bedSearchResult)).toEqual(
        Buffer.from(JSON.stringify(bedSearchResult)).toString('base64'),
      )
    })
  })

  describe('decodeBedSearchResult', () => {
    it('decodes a Base64 encoded bed search result', () => {
      const bedSearchResult = bedSearchResultFactory.build()
      const encodedResult = encodeBedSearchResult(bedSearchResult)

      expect(decodeBedSearchResult(encodedResult)).toEqual(bedSearchResult)
    })

    it('throws an error if the object is not a bed search result', () => {
      const obj = Buffer.from('{"foo":"bar"}').toString('base64')

      expect(() => decodeBedSearchResult(obj)).toThrowError(InvalidBedSearchDataException)
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

  describe('summaryCardHeader', () => {
    it('returns a link to the confirm page with the premises name and bed', () => {
      const bedSearchResult = bedSearchResultFactory.build()
      const placementRequestId = '123'
      const startDate = '2022-01-01'
      const durationWeeks = '4'
      const durationDays = '1'

      summaryCardHeader({ bedSearchResult, placementRequestId, startDate, durationDays, durationWeeks })

      expect(linkTo).toHaveBeenCalledWith(
        paths.placementRequests.bookings.confirm,
        { id: placementRequestId },
        {
          text: `${bedSearchResult.premises.name} (Bed ${bedSearchResult.bed.name})`,
          query: {
            bedSearchResult: encodeBedSearchResult(bedSearchResult),
            startDate,
            duration: String(Number(durationWeeks) * 7 + Number(durationDays)),
          },
        },
      )
    })
  })

  describe('confirmationSummaryCardRows', () => {
    it('should call the correct row functions', () => {
      const bedSearchResult = bedSearchResultFactory.build()
      const dates = {
        startDate: '2022-01-01',
        endDate: '2022-01-15',
        placementLength: 2,
      }

      expect(confirmationSummaryCardRows(bedSearchResult, dates)).toEqual([
        premisesNameRow(bedSearchResult),
        bedNameRow(bedSearchResult),
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

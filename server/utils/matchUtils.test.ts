import {
  apCharacteristicPairFactory,
  bedSearchParametersFactory,
  bedSearchParametersUiFactory,
  bedSearchResultFactory,
} from '../testutils/factories'
import { DateFormats } from './dateUtils'
import {
  InvalidBedSearchDataException,
  additionalCharacteristicsRow,
  addressRow,
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
  mapSearchParamCharacteristicsForUi,
  mapSearchResultCharacteristicsForUi,
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
  translateApiCharacteristicForUi,
  unmatchedCharacteristics,
} from './matchUtils'
import {
  accessibilityOptions,
  offenceAndRiskOptions,
  placementCriteria,
  placementRequirementOptions,
  specialistApTypeOptions,
  specialistSupportOptions,
} from './placementCriteriaUtils'

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
      const uiParams = bedSearchParametersUiFactory.build({ durationWeeks: '2', durationDays: '1' })

      expect(mapUiParamsForApi(uiParams)).toEqual({
        ...uiParams,
        durationDays: 15,
        maxDistanceMiles: Number(uiParams.maxDistanceMiles),
      })
    })
  })

  describe('translateApiCharacteristicForUi', () => {
    it('it returns the search results characteristics names in a list', () => {
      expect(mapSearchResultCharacteristicsForUi([{ name: 'some characteristic' }])).toEqual(
        `<ul class="govuk-list"><li>Some characteristic</li></ul>`,
      )
    })
  })

  describe('mapSearchResultCharacteristicsForUi', () => {
    it('it returns the search results characteristics names in a list', () => {
      expect(mapSearchParamCharacteristicsForUi(['some characteristic'])).toEqual(
        '<ul class="govuk-list"><li>Some characteristic</li></ul>',
      )
    })
  })

  describe('mapApiCharacteristicForUi', () => {
    it('if the characteristic name is defined it is returned in a human readable format', () => {
      expect(translateApiCharacteristicForUi('isESAP')).toBe('ESAP')
      expect(translateApiCharacteristicForUi('isIAP')).toBe('IAP')
      expect(translateApiCharacteristicForUi('isPIPE')).toBe('PIPE')
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
        'Type of AP': checkBoxesForCriteria(specialistApTypeOptions, []),
        'Specialist AP': checkBoxesForCriteria(specialistSupportOptions, []),
        'Placement Requirements': checkBoxesForCriteria(placementRequirementOptions, []),
        'Risks and offences to consider': checkBoxesForCriteria(offenceAndRiskOptions, []),
        'Would benefit from': checkBoxesForCriteria(accessibilityOptions, []),
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
      const essentialCriteria = [
        'isPIPE',
        'isSemiSpecialistMentalHealth',
        'isRecoveryFocussed',
        'isSuitableForVulnerable',
      ]

      expect(groupedEssentialCriteria(essentialCriteria)).toEqual({
        'Type of AP': [placementCriteria.isPIPE],
        'Specialist AP': [placementCriteria.isSemiSpecialistMentalHealth, placementCriteria.isRecoveryFocussed],
        'Risks and offences to consider': [placementCriteria.isSuitableForVulnerable],
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
      expect(placementLength(2)).toEqual('2 weeks')
    })
  })

  describe('placementDates', () => {
    it('returns formatted versions of the placement dates and durations', () => {
      const startDate = '2022-01-01'
      const lengthInWeeks = '2'

      expect(placementDates(startDate, lengthInWeeks)).toEqual({
        startDate: '2022-01-01',
        endDate: '2022-01-15',
        placementLength: 2,
      })
    })
  })

  describe('summaryCardHeader', () => {
    it('returns a link to the confirm page with the premises name and bed', () => {
      const bedSearchResult = bedSearchResultFactory.build()
      const placementRequestId = '123'
      const startDate = '2022-01-01'
      const durationWeeks = '4'

      expect(summaryCardHeader(bedSearchResult, placementRequestId, startDate, durationWeeks)).toEqual(
        `<a href="/placement-requests/${placementRequestId}/bookings/confirm?bedSearchResult=${encodeURIComponent(
          encodeBedSearchResult(bedSearchResult),
        )}&startDate=${startDate}&durationWeeks=${durationWeeks}" >${bedSearchResult.premises.name} (Bed ${
          bedSearchResult.bed.name
        })</a>`,
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
})

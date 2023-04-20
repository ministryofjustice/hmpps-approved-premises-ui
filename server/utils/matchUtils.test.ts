import {
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
  confirmationSummaryCardRows,
  decodeBedSearchResult,
  departureDateRow,
  encodeBedSearchResult,
  mapApiParamsForUi,
  mapSearchParamCharacteristicsForUi,
  mapSearchResultCharacteristicsForUi,
  mapUiParamsForApi,
  matchedCharacteristicsRow,
  placementDates,
  placementLength,
  placementLengthRow,
  premisesNameRow,
  searchFilter,
  startDateObjFromParams,
  summaryCardHeader,
  summaryCardRows,
  townRow,
  translateApiCharacteristicForUi,
} from './matchUtils'

describe('matchUtils', () => {
  describe('mapUiParamsForApi', () => {
    it('converts string properties to numbers', () => {
      const uiParams = bedSearchParametersUiFactory.build({ durationWeeks: '2' })

      expect(mapUiParamsForApi(uiParams)).toEqual({
        ...uiParams,
        durationDays: 14,
        maxDistanceMiles: Number(uiParams.maxDistanceMiles),
      })
    })
  })

  describe('mapApiParamsForUi', () => {
    const apiParams = bedSearchParametersFactory.build({ durationDays: 14 })

    expect(mapApiParamsForUi(apiParams)).toEqual({
      ...apiParams,
      durationWeeks: '2',
      maxDistanceMiles: apiParams.maxDistanceMiles.toString(),
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

  describe('searchFilter', () => {
    it('maps the placementCriteria array and selectedValues array into the array of objects for checkbox inputs', () => {
      expect(searchFilter(['isESAP', 'isIAP', 'isSemiSpecialistMentalHealth'], ['isESAP', 'isIAP'])).toEqual([
        {
          checked: true,
          text: 'ESAP',
          value: 'isESAP',
        },
        { text: 'IAP', value: 'isIAP', checked: true },
        {
          checked: false,
          text: 'Semi specialist mental health',
          value: 'isSemiSpecialistMentalHealth',
        },
      ])
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
        startDate: 'Saturday 1 January 2022',
        endDate: 'Saturday 15 January 2022',
        placementLength: '2 weeks',
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
        startDate: 'Saturday 1 January 2022',
        endDate: 'Saturday 15 January 2022',
        placementLength: '2 weeks',
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

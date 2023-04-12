import { BedSearchParametersUi } from '../@types/ui'

import { bedSearchParametersFactory, bedSearchResultFactory } from '../testutils/factories'
import { DateFormats } from './dateUtils'
import {
  addressRow,
  bedCountRow,
  mapApiParamsForUi,
  mapSearchParamCharacteristicsForUi,
  mapSearchResultCharacteristicsForUi,
  mapUiParamsForApi,
  premisesCharacteristicsRow,
  roomCharacteristicsRow,
  searchFilter,
  startDateObjFromParams,
  summaryCardRows,
  townRow,
  translateApiCharacteristicForUi,
} from './matchUtils'

describe('matchUtils', () => {
  describe('mapUiParamsForApi', () => {
    it('converts string properties to numbers', () => {
      const uiParams = bedSearchParametersFactory
        .onCreate(mapApiParamsForUi)
        .build() as unknown as BedSearchParametersUi

      expect(mapUiParamsForApi(uiParams)).toEqual({
        ...uiParams,
        durationDays: Number(uiParams.durationDays),
        maxDistanceMiles: Number(uiParams.maxDistanceMiles),
      })
    })
  })

  describe('mapApiParamsForUi', () => {
    const apiParams = bedSearchParametersFactory.build()

    expect(mapApiParamsForUi(apiParams)).toEqual({
      ...apiParams,
      durationDays: apiParams.durationDays.toString(),
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
      expect(summaryCardRows(bedSearchResult.results[0])).toEqual([
        townRow(bedSearchResult.results[0]),
        addressRow(bedSearchResult.results[0]),
        premisesCharacteristicsRow(bedSearchResult.results[0]),
        roomCharacteristicsRow(bedSearchResult.results[0]),
        bedCountRow(bedSearchResult.results[0]),
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
})

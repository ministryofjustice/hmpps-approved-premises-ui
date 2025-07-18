import { faker } from '@faker-js/faker'
import { addDays } from 'date-fns'
import { cas1NationalOccupancyFactory, cruManagementAreaFactory } from '../../testutils/factories'
import {
  CRU_AREA_WOMENS,
  expandManagementArea,
  getApTypeOptions,
  getDateHeader,
  getManagementAreaSelectGroups,
  getPagination,
  processCapacity,
} from './nationalOccupancyUtils'
import { apTypeLongLabels, apTypeShortLabels } from '../apTypeLabels'
import { apTypes } from '../placementCriteriaUtils'
import { DateFormats } from '../dateUtils'
import { roundNumber } from '../utils'

describe('nationalOccupancyUtils', () => {
  const mensAreas = cruManagementAreaFactory.buildList(6)
  const womensArea = cruManagementAreaFactory.build({ id: CRU_AREA_WOMENS })
  const cruManagementAreas = [...mensAreas, womensArea]

  describe('getManagementAreaSelectGroups', () => {
    const resultNoSelect = () => [
      {
        label: "Men's AP",
        items: [
          { text: "All areas - Men's", value: 'allMens', selected: false },
          ...mensAreas.map(({ id, name }) => ({ value: id, text: name, selected: false })),
        ],
      },
      {
        label: "Women's AP",
        items: [{ value: 'allWomens', text: "All areas - Women's", selected: false }],
      },
    ]

    it('should generate a nested list of cru management areas with allMens selected by default', () => {
      const expected = resultNoSelect()
      expected[0].items[0].selected = true
      expect(getManagementAreaSelectGroups(cruManagementAreas, undefined, undefined)).toEqual(expected)
    })

    it(`should select allMens if user has a men's area id`, () => {
      const expected = resultNoSelect()
      expected[0].items[0].selected = true
      expect(getManagementAreaSelectGroups(cruManagementAreas, undefined, mensAreas[1].id)).toEqual(expected)
    })

    it(`should select allWomens if the user has the women's area id`, () => {
      const expected = resultNoSelect()
      expected[1].items[0].selected = true
      expect(getManagementAreaSelectGroups(cruManagementAreas, undefined, CRU_AREA_WOMENS)).toEqual(expected)
    })

    it(`should select the currently selected area if an area id is selected`, () => {
      const expected = resultNoSelect()
      expected[0].items[2].selected = true
      expect(getManagementAreaSelectGroups(cruManagementAreas, mensAreas[1].id, CRU_AREA_WOMENS)).toEqual(expected)
    })

    it(`should select allMens if that was selected`, () => {
      const expected = resultNoSelect()
      expected[0].items[0].selected = true
      expect(getManagementAreaSelectGroups(cruManagementAreas, 'allMens', CRU_AREA_WOMENS)).toEqual(expected)
    })
  })

  describe('getApTypeOptions', () => {
    it('should render a set of ap type options with nothing selected', () => {
      const optionList = getApTypeOptions()
      expect(optionList).toHaveLength(Object.keys(apTypeLongLabels).length)
      expect(optionList.findIndex(({ selected }) => selected)).toEqual(-1)
    })

    it('should render a set of ap type options with one selected', () => {
      const optionList = getApTypeOptions(Object.keys(apTypeLongLabels)[3])
      expect(optionList.findIndex(({ selected }) => selected)).toEqual(3)
    })
  })

  describe('expandManagementArea', () => {
    it(`should expand the 'allMens' management area to an array of men's real management area ids`, () => {
      expect(expandManagementArea(cruManagementAreas, 'allMens')).toEqual(mensAreas.map(({ id }) => id))
    })
    it(`should expand the 'allWomens' management area to an array of the single women's management area id`, () => {
      expect(expandManagementArea(cruManagementAreas, 'allWomens')).toEqual([CRU_AREA_WOMENS])
    })
    it(`should return a single men's area id as an array`, () => {
      const { id } = mensAreas[1]
      expect(expandManagementArea(cruManagementAreas, id)).toEqual([id])
    })
  })

  describe('processCapacity', () => {
    it('should process the received capacity into a structure for the template to consume', () => {
      const postcode = 'RG15'
      const apiCapacity = cas1NationalOccupancyFactory.build()

      const processed = processCapacity(apiCapacity, postcode, 'normal')
      expect(processed).toHaveLength(apiCapacity.premises.length)
      processed.forEach(({ summaryRows, apCapacity }, index) => {
        const ap = apiCapacity.premises[index]
        expect(summaryRows[0]).toMatch(ap.summary.name)
        expect(summaryRows[1]).toEqual(apTypeShortLabels[ap.summary.apType])
        expect(summaryRows[2]).toEqual(`${roundNumber(ap.distanceInMiles,1)} miles from ${postcode}`)
        apCapacity.forEach(({ capacity, classes, link }, characteristicIndex) => {
          const { forRoomCharacteristic, inServiceBedCount, vacantBedCount } = ap.capacity[characteristicIndex]
          expect(classes).toEqual(vacantBedCount > 0 ? 'govuk-tag--green' : 'govuk-tag--red')
          expect(capacity).toEqual(
            forRoomCharacteristic ? `${vacantBedCount}` : `${vacantBedCount}/${inServiceBedCount}`,
          )
          expect(link).toEqual('#')
        })
      })
    })

    it('should filter out APs of the wrong type', () => {
      const filterApType = faker.helpers.arrayElement(apTypes.filter(apType => apType !== 'normal'))
      const apiCapacity = cas1NationalOccupancyFactory.build()
      apiCapacity.premises[1].summary.apType = filterApType

      const filtered = processCapacity(apiCapacity, 'RG15', filterApType)
      expect(filtered).toHaveLength(
        apiCapacity.premises.filter(({ summary }) => summary.apType === filterApType).length,
      )

      const unFiltered = processCapacity(apiCapacity, 'RG15', 'normal')
      expect(unFiltered).toHaveLength(apiCapacity.premises.length)
    })
  })

  describe('getPagination', () => {
    it('should return a pagination definition with the correct links', () => {
      const result = getPagination('2025-07-25')
      expect(result).toEqual(
        expect.objectContaining({
          previous: {
            text: 'Previous week',
            href: `/admin/national-occupancy?fromDate=2025-07-18`,
          },
          next: {
            text: 'Next week',
            href: `/admin/national-occupancy?fromDate=2025-08-01`,
          },
        }),
      )
    })
  })

  describe('getDateHeader', () => {
    const startDate: Date = faker.date.soon()
    const nationalOccupancy = cas1NationalOccupancyFactory.build({
      startDate: DateFormats.dateObjToIsoDate(startDate),
      endDate: DateFormats.dateObjToIsoDate(addDays(startDate, 6)),
    })

    it('should return an array of dates for the table header row', () => {
      const dateHeader = getDateHeader(nationalOccupancy)
      expect(dateHeader).toHaveLength(7)
      expect(dateHeader[0]).toEqual(DateFormats.dateObjtoUIDate(startDate, { format: 'longNoYear' }))
      expect(dateHeader[6]).toEqual(DateFormats.dateObjtoUIDate(addDays(startDate, 6), { format: 'longNoYear' }))
    })
  })
})

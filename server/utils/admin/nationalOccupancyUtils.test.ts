import { faker } from '@faker-js/faker'
import { addDays } from 'date-fns'
import { Cas1SpaceBookingCharacteristic, Cas1SpaceCharacteristic } from '@approved-premises/api'
import { cas1NationalOccupancyFactory, cruManagementAreaFactory } from '../../testutils/factories'
import {
  CRU_AREA_WOMENS,
  expandManagementArea,
  getApTypeOptions,
  getCriteriaBlock,
  getDateHeader,
  getManagementAreaSelectGroups,
  getPagination,
  processCapacity,
} from './nationalOccupancyUtils'
import { apTypeLongLabels, apTypeShortLabels } from '../apTypeLabels'
import { DateFormats } from '../dateUtils'
import { createQueryString } from '../utils'

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
    it.each([
      ['with criteria', ['hasEnsuite']],
      ['without criteria', undefined],
    ])(
      'should process the received capacity into a structure for the template to consume %s',
      (_, roomCriteria: Array<Cas1SpaceBookingCharacteristic>) => {
        const postcode = 'RG15'
        const apiCapacity = cas1NationalOccupancyFactory.build()
        const processed = processCapacity(
          apiCapacity,
          postcode,
          roomCriteria as unknown as Array<Cas1SpaceBookingCharacteristic>,
        )

        expect(processed).toHaveLength(apiCapacity.premises.length)
        processed.forEach(({ summaryRows, apCapacity }, index) => {
          const ap = apiCapacity.premises[index]
          expect(summaryRows[0]).toMatch(ap.summary.name)
          expect(summaryRows[1]).toEqual(apTypeShortLabels[ap.summary.apType])
          expect(summaryRows[2]).toEqual(`${ap.distanceInMiles.toFixed(1)} miles from ${postcode}`)
          apCapacity.forEach(({ capacity, classes, link }, characteristicIndex) => {
            const { inServiceBedCount, vacantBedCount, date } = ap.capacity[characteristicIndex]
            expect(classes).toEqual(vacantBedCount > 0 ? 'govuk-tag--green' : 'govuk-tag--red')
            expect(capacity).toEqual(
              roomCriteria?.length ? `${vacantBedCount}` : `${vacantBedCount}/${inServiceBedCount}`,
            )
            expect(link).toEqual(
              `/admin/national-occupancy/premises/${ap.summary.id}/date/${date}${createQueryString(
                { criteria: roomCriteria },
                {
                  arrayFormat: 'repeat',
                  addQueryPrefix: true,
                },
              )}`,
            )
          })
        })
      },
    )
  })

  describe('getPagination', () => {
    it('should return a pagination definition with the correct links', () => {
      const result = getPagination('2025-07-25')
      expect(result).toEqual(
        expect.objectContaining({
          previous: {
            text: 'Previous week',
            href: `/admin/national-occupancy?fromDate=2025-07-18#calendar-heading`,
          },
          next: {
            text: 'Next week',
            href: `/admin/national-occupancy?fromDate=2025-08-01#calendar-heading`,
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

  describe('getCriteriaBlock', () => {
    const roomCriteria: Array<Cas1SpaceBookingCharacteristic> = ['isArsonSuitable', 'isStepFreeDesignated']
    const apCriteria: Array<Cas1SpaceCharacteristic> = ['acceptsChildSexOffenders', 'isCatered']
    it('should render the criteria block', () => {
      expect(getCriteriaBlock(apCriteria, roomCriteria)).toEqual(
        `<dl class="details-list"><dt>AP criteria:</dt><dd>Sexual offences against children,</dd><dd>Catered</dd><dt>Room criteria:</dt><dd>Suitable for active arson risk,</dd><dd>Step-free</dd></dl>`,
      )
    })
    it('should handle empty and undefined lists', () => {
      expect(getCriteriaBlock([], undefined)).toEqual(
        `<dl class="details-list"><dt>AP criteria:</dt><dd>None</dd><dt>Room criteria:</dt><dd>None</dd></dl>`,
      )
    })
  })
})

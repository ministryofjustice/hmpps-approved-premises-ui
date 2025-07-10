import { cruManagementAreaFactory } from '../../testutils/factories'
import { CRU_AREA_WOMENS, getManagementAreaSelectGroups } from './nationalOccupancyUtils'

describe('nationalOccupancyUtils', () => {
  describe('getManagementAreaSelectGroups', () => {
    const mensAreas = cruManagementAreaFactory.buildList(6)
    const womensArea = cruManagementAreaFactory.build({ id: CRU_AREA_WOMENS })
    const cruManagementAreas = [...mensAreas, womensArea]
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
})

import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared'

import PlansInPlace from './plansInPlace'

describe('PlansInPlace', () => {
  const body = {
    arePlansInPlace: 'yes' as const,
    plansInPlaceDetail: 'Plans in place detail',
    plansNotInPlaceDetail: 'Plans not in place detail',
  }

  describe('title', () => {
    expect(new PlansInPlace({}).title).toBe('Placement duration and move on')
  })

  describe('body', () => {
    it('should set the body when plans are in place', () => {
      const page = new PlansInPlace(body)
      expect(page.body).toEqual({ arePlansInPlace: 'yes', plansInPlaceDetail: 'Plans in place detail' })
    })

    it('should set the body when plans are not in place', () => {
      const page = new PlansInPlace({ ...body, arePlansInPlace: 'no' })
      expect(page.body).toEqual({ arePlansInPlace: 'no', plansNotInPlaceDetail: 'Plans not in place detail' })
    })
  })

  itShouldHaveNextValue(new PlansInPlace({}), 'type-of-accommodation')
  itShouldHavePreviousValue(new PlansInPlace({}), 'relocation-region')

  describe('errors', () => {
    it('returns an error when the body is empty', () => {
      const page = new PlansInPlace({})
      expect(page.errors()).toEqual({
        arePlansInPlace:
          'You must answer whether move on arrangements are already in place for when the person leaves the AP',
      })
    })

    it('returns an error when arePlansInPlace is yes and plansInPlaceDetail is empty', () => {
      const page = new PlansInPlace({ arePlansInPlace: 'yes' })
      expect(page.errors()).toEqual({
        plansInPlaceDetail: 'You must provide further details of the move on plan',
      })
    })

    it('returns an error when arePlansInPlace is no and plansNotInPlaceDetail is empty', () => {
      const page = new PlansInPlace({ arePlansInPlace: 'no' })
      expect(page.errors()).toEqual({
        plansNotInPlaceDetail:
          'You must provide detail about any plans to secure accommodation in preparation for move on',
      })
    })
  })

  describe('response', () => {
    it('should return detail if yes is selected', () => {
      const page = new PlansInPlace(body)
      expect(page.response()).toEqual({
        'Are move on arrangements already in place for when the person leaves the AP?': `Yes - Plans in place detail`,
      })
    })

    it('should return detail if no is selected', () => {
      const page = new PlansInPlace({ ...body, arePlansInPlace: 'no' })
      expect(page.response()).toEqual({
        'Are move on arrangements already in place for when the person leaves the AP?': `No - Plans not in place detail`,
      })
    })
  })
})

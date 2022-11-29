import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import PlansInPlace from './plansInPlace'

describe('PlansInPlace', () => {
  describe('title', () => {
    expect(new PlansInPlace({}).title).toBe('Placement duration and move on')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new PlansInPlace({ arePlansInPlace: 'yes' })
      expect(page.body).toEqual({ arePlansInPlace: 'yes' })
    })
  })

  itShouldHaveNextValue(new PlansInPlace({}), 'type-of-accommodation')
  itShouldHavePreviousValue(new PlansInPlace({}), 'pdu-region')

  describe('errors', () => {
    const page = new PlansInPlace({})
    expect(page.errors()).toEqual({
      arePlansInPlace:
        'You must answer whether move on arrangements are already in place for when the person leaves the AP',
    })
  })

  describe('response', () => {
    const page = new PlansInPlace({ arePlansInPlace: 'yes' })
    expect(page.response()).toEqual({
      'Are move on arrangements already in place for when the person leaves the AP?': 'Yes',
    })
  })
})

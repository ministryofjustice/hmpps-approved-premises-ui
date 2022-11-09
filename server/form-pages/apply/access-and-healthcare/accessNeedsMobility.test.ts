import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import AccessNeedsMobility from './accessNeedsMobility'

import applicationFactory from '../../../testutils/factories/application'
import personFactory from '../../../testutils/factories/person'

describe('AccessNeedsMobility', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  describe('title', () => {
    expect(new AccessNeedsMobility({}, application).title).toBe('Access needs')
  })

  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new AccessNeedsMobility(
        {
          needsWheelchair: 'yes',
          mobilityNeeds: 'mobility needs',
          visualImpairment: 'visual impairment',
          anotherThing: 'here',
        },
        application,
      )
      expect(page.body).toEqual({
        needsWheelchair: 'yes',
        visualImpairment: 'visual impairment',
        mobilityNeeds: 'mobility needs',
      })
    })
  })

  itShouldHaveNextValue(new AccessNeedsMobility({}, application), 'covid')
  itShouldHavePreviousValue(new AccessNeedsMobility({}, application), 'access-needs')

  describe('errors', () => {
    const page = new AccessNeedsMobility({}, application)
    expect(page.errors()).toEqual({
      needsWheelchair: 'You must confirm the need for a wheelchair',
    })
  })

  describe('response', () => {
    it('returns the correct plain english responses for the questions', () => {
      const page = new AccessNeedsMobility(
        {
          needsWheelchair: 'yes',
          mobilityNeeds: 'Mobility needs',
          visualImpairment: 'Visual impairment',
        },
        application,
      )

      expect(page.response()).toEqual({
        'Does John Wayne require use of a wheelchair?': 'Yes',
        'Mobility needs': 'Mobility needs',
        'Visual Impairment': 'Visual impairment',
      })
    })
  })
})

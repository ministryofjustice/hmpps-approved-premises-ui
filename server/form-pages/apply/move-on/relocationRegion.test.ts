import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import RelocationRegion from './relocationRegion'
import applicationFactory from '../../../testutils/factories/application'
import personFactory from '../../../testutils/factories/person'

describe('RelocationRegion', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  describe('title', () => {
    expect(new RelocationRegion({}, application).title).toBe('Placement duration and move on')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new RelocationRegion({ postcodeArea: 'some code' }, application)
      expect(page.body).toEqual({ postcodeArea: 'some code' })
    })
  })

  itShouldHaveNextValue(new RelocationRegion({}, application), 'plans-in-place')
  itShouldHavePreviousValue(new RelocationRegion({}, application), 'placement-duration')

  describe('errors', () => {
    it('returns an error if not passed any input for the postcode', () => {
      const page = new RelocationRegion({}, application)

      expect(page.errors()).toEqual({
        postcodeArea: 'You must enter a postcode region',
      })
    })

    it('returns an error if passed an invalid postcode', () => {
      const page = new RelocationRegion({ postcodeArea: 'foo' }, application)

      expect(page.errors()).toEqual({
        postcodeArea: 'You must enter a valid postcode region',
      })
    })
  })

  describe('response', () => {
    const page = new RelocationRegion({ postcodeArea: 'XX1 1XX' }, application)

    expect(page.response()).toEqual({
      'Where is John Wayne most likely to live when they move on from the AP?': 'XX1 1XX',
    })
  })
})

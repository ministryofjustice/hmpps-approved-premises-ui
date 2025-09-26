import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared'

import RelocationRegion from './relocationRegion'

describe('RelocationRegion', () => {
  describe('title', () => {
    expect(new RelocationRegion({}).title).toBe('Placement duration and move on')
  })

  describe('body', () => {
    it('should uppercase and set the body', () => {
      const page = new RelocationRegion({ postcodeArea: 'some code' })
      expect(page.body).toEqual({ postcodeArea: 'SOME CODE' })
    })
  })

  itShouldHaveNextValue(new RelocationRegion({}), 'plans-in-place')
  itShouldHavePreviousValue(new RelocationRegion({}), 'placement-duration')

  describe('errors', () => {
    it('returns an error if not passed any input for the postcode', () => {
      const page = new RelocationRegion({})

      expect(page.errors()).toEqual({
        postcodeArea: 'You must enter a postcode area',
      })
    })

    it('returns an error if passed an invalid postcode', () => {
      const page = new RelocationRegion({ postcodeArea: 'foo' })

      expect(page.errors()).toEqual({
        postcodeArea: 'You must enter a valid postcode area',
      })
    })
  })

  describe('response', () => {
    const page = new RelocationRegion({ postcodeArea: 'XX1 1XX' })

    expect(page.response()).toEqual({
      'Where is the person most likely to live when they move on from the AP?': 'XX1 1XX',
    })
  })
})

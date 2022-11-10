import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import PlacementDuration from './placementDuration'

describe('PlacementDuration', () => {
  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const body = { duration: 4, durationDetail: 'Some detail' }
      const page = new PlacementDuration({ ...body, something: 'else' })

      expect(page.body).toEqual(body)
    })
  })

  itShouldHaveNextValue(new PlacementDuration({}), '')
  itShouldHavePreviousValue(new PlacementDuration({}), '')

  describe('errors', () => {
    it('returns an error if the duration is blank', () => {
      const page = new PlacementDuration({})

      expect(page.errors()).toEqual({ duration: 'You must specify the duration of the placement' })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new PlacementDuration({ duration: 4, durationDetail: 'Some detail' })

      expect(page.response()).toEqual({
        'What duration of placement do you recommend?': '4 weeks',
        'Provide any additional information': 'Some detail',
      })
    })

    it("should not include the detail if it's blank", () => {
      const page = new PlacementDuration({ duration: 4, durationDetail: '' })

      expect(page.response()).toEqual({ 'What duration of placement do you recommend?': '4 weeks' })
    })
  })
})

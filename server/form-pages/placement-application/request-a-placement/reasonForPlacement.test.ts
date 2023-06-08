import { PlacementType } from '../../../@types/shared'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import ReasonForPlacement from './reasonForPlacement'

describe('ReasonForPlacement', () => {
  describe('title', () => {
    expect(new ReasonForPlacement({}).title).toBe('Reason for placement')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new ReasonForPlacement({
        reason: 'rotl',
      })
      expect(page.body).toEqual({
        reason: 'rotl',
      })
    })
  })

  describe('if the reason is rotl', () => {
    itShouldHaveNextValue(new ReasonForPlacement({ reason: 'rotl' }), 'previous-rotl-placement')
  })

  describe('if the reason is additional_placement', () => {
    itShouldHaveNextValue(new ReasonForPlacement({ reason: 'additional_placement' }), 'additional-placement-details')
  })

  describe('if the reason is release_following_decision', () => {
    itShouldHaveNextValue(new ReasonForPlacement({ reason: 'release_following_decision' }), 'decision-to-release')
  })

  describe('if the reason is not one of the prescribed reasons', () => {
    expect(() => new ReasonForPlacement({ reason: 'a made up reason' as PlacementType }).next()).toThrowError()
  })

  itShouldHavePreviousValue(new ReasonForPlacement({}), '')

  describe('errors', () => {
    it('if no response is given an error is returned', () => {
      expect(new ReasonForPlacement({}).errors()).toEqual({
        reason: 'You must state the reason for placement',
      })
    })
  })

  describe('response', () => {
    it("If the response is 'no' only the response is returned", () => {
      expect(
        new ReasonForPlacement({
          reason: 'rotl',
        }).response(),
      ).toEqual({
        'Why are you requesting a placement?': 'Release on Temporary Licence (ROTL)',
      })
    })
  })
})

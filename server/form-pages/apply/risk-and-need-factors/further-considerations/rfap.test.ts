import { itShouldHavePreviousValue } from '../../../shared-examples'

import Rfap, { RfapBody } from './rfap'

const body: RfapBody = {
  needARfap: 'yes' as const,
}

describe('Rfap', () => {
  describe('body', () => {
    it('should set the body', () => {
      const page = new Rfap(body)

      expect(page.body).toEqual(body)
    })
  })

  describe('if the answer is "yes"', () => {
    it('should have the next value of rfap-details', () => {
      expect(new Rfap({ needARfap: 'yes' }).next()).toBe('rfap-details')
    })
  })

  describe('if the answer is "no"', () => {
    it('should have the next value of catering', () => {
      expect(new Rfap({ needARfap: 'no' }).next()).toBe('catering')
    })
  })

  itShouldHavePreviousValue(new Rfap({}), 'previous-placements')

  describe('errors', () => {
    it('shows errors if the yes/no question is blank', () => {
      const page = new Rfap({})

      expect(page.errors()).toEqual({
        needARfap: 'You must state if this person needs a RFAP',
      })
    })
  })

  describe('response', () => {
    it('returns a plain english response object', () => {
      const page = new Rfap(body)

      expect(page.response()).toEqual({
        'Does this person need a RFAP?': 'Yes',
      })
    })
  })
})

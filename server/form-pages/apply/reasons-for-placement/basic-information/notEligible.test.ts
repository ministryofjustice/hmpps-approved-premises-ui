import NotEligible from './notEligible'
import { applicationFactory } from '../../../../testutils/factories'
import { fullPersonFactory } from '../../../../testutils/factories/person'

describe('NotEligible', () => {
  const person = fullPersonFactory.build({ name: 'John Doe' })
  const application = applicationFactory.build({ person })

  describe('title', () => {
    it('should return the title and tier', () => {
      const page = new NotEligible({}, application)

      expect(page.title).toEqual('John Doe is not eligible for an AP placement')
    })
  })

  describe('tier', () => {
    it('shows the live tier', () => {
      const page = new NotEligible({}, application)
      expect(page.tier).toEqual(person.tier.tierScore)
    })
  })

  describe('basic page values', () => {
    it('should return the correct basic page values', () => {
      const page = new NotEligible({}, application)
      expect(page.next()).toEqual('')
      expect(page.previous()).toEqual('')
      expect(page.response()).toEqual({})
      expect(page.errors()).toEqual({})
    })
  })
})

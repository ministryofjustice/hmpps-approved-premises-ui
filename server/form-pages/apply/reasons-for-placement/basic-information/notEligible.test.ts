import NotEligible from './notEligible'
import { applicationFactory } from '../../../../testutils/factories'
import { fullPersonFactory } from '../../../../testutils/factories/person'
import config from '../../../../config'

describe('NotEligible', () => {
  const person = fullPersonFactory.build({ name: 'John Doe' })
  const application = applicationFactory.build({ person })

  describe('title', () => {
    it('should return the title', () => {
      const page = new NotEligible({}, application)

      expect(page.title).toEqual('John Doe is not eligible for an AP placement')
      expect(page.tier).toEqual(application.risks.tier.value.level)
    })
  })

  describe('tier', () => {
    beforeEach(() => {
      config.flags.useLiveTiers = true
    })

    afterEach(() => {
      config.flags.useLiveTiers = false
    })

    it('shows the live tier', () => {
      const page = new NotEligible({}, application)
      expect(page.tier).toEqual(person.tier.tierScore)
    })

    it('shows the static application tier if live tiers are not enabled', () => {
      config.flags.useLiveTiers = false
      const page = new NotEligible({}, application)
      expect(page.tier).toEqual(application.risks.tier.value.level)
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

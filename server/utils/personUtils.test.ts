import { RiskTier, TierDto } from '@approved-premises/api'
import {
  fullPersonFactory,
  fullPersonSummaryFactory,
  restrictedPersonFactory,
  restrictedPersonSummaryFactory,
  unknownPersonFactory,
  unknownPersonSummaryFactory,
} from '../testutils/factories/person'
import {
  displayName,
  getTierOrBlank,
  getVersionedTierOrBlank,
  isApplicableTier,
  isFullPerson,
  isNotRestrictedPerson,
  isUnknownPerson,
  personTier,
  tierBadge,
  versionedTierBadge,
} from './personUtils'
import tierDtoFactory from '../testutils/factories/tierDto'
import config from '../config'

describe('personUtils', () => {
  describe('tierBadge', () => {
    it('returns the correct tier badge for A', () => {
      expect(tierBadge('A')).toEqual('<span class="moj-badge moj-badge--red">A</span>')
    })

    it('returns the correct tier badge for B', () => {
      expect(tierBadge('B')).toEqual('<span class="moj-badge moj-badge--purple">B</span>')
    })

    it('returns the correct tier badge for C', () => {
      expect(tierBadge('C')).toEqual('<span class="moj-badge undefined">C</span>')
    })
  })

  describe('versionedTierBadge', () => {
    it('returns the correct tier badge for version 2, A', () => {
      expect(versionedTierBadge(tierDtoFactory.v2().build({ tierScore: 'A' }))).toEqual(
        '<span class="moj-badge moj-badge--red">A</span>',
      )
    })

    it('returns the correct tier badge for version 2, B', () => {
      expect(versionedTierBadge(tierDtoFactory.v2().build({ tierScore: 'B' }))).toEqual(
        '<span class="moj-badge moj-badge--purple">B</span>',
      )
    })

    it('returns the correct tier badge for version 2, C', () => {
      expect(versionedTierBadge(tierDtoFactory.v2().build({ tierScore: 'C' }))).toEqual(
        '<span class="moj-badge undefined">C</span>',
      )
    })

    it.each(['A', 'B', 'C'])(
      'returns the correct, consistently coloured tiers badges for version 3 tiers "%s"',
      tier => {
        expect(versionedTierBadge(tierDtoFactory.v3().build({ tierScore: tier }))).toEqual(
          `<span class="moj-badge">${tier}</span>`,
        )
      },
    )
  })

  describe('isApplicableTier', () => {
    it(`returns true if the person's sex is male and has an applicable tier`, () => {
      expect(isApplicableTier('Male', 'A1')).toBeTruthy()
    })

    it(`returns false if the person's sex is male and has a tier that is not applicable to males`, () => {
      expect(isApplicableTier('Male', 'C3')).toBeFalsy()
    })

    it(`returns false if the person's sex is male and has an inapplicable tier`, () => {
      expect(isApplicableTier('Male', 'D1')).toBeFalsy()
    })

    it(`returns true if the person's sex is female and has an applicable tier`, () => {
      expect(isApplicableTier('Female', 'A3')).toBeTruthy()
    })

    it(`returns true if the person's sex is female and has a tier that is applicable to females`, () => {
      expect(isApplicableTier('Female', 'C3')).toBeTruthy()
    })

    it(`returns false if the person's sex is female and has an inapplicable tier`, () => {
      expect(isApplicableTier('Female', 'D1')).toBeFalsy()
    })
  })

  describe('isFullPerson', () => {
    it('returns true if the person is a full person', () => {
      expect(isFullPerson(fullPersonFactory.build())).toEqual(true)
    })

    it('returns false if the person is a restricted person', () => {
      expect(isFullPerson(restrictedPersonFactory.build())).toEqual(false)
    })
  })

  describe('isNotRestrictedPerson', () => {
    it('returns true if the person or personSummary is not restricted', () => {
      expect(isNotRestrictedPerson(fullPersonFactory.build())).toEqual(true)
      expect(isNotRestrictedPerson(fullPersonSummaryFactory.build())).toEqual(true)
    })
    it('returns false if the person or personSummary is restricted', () => {
      expect(isNotRestrictedPerson(restrictedPersonFactory.build())).toEqual(false)
      expect(isNotRestrictedPerson(restrictedPersonSummaryFactory.build())).toEqual(false)
    })
  })

  describe('displayName', () => {
    describe('with a Full Person', () => {
      it('returns the name if not restricted', () => {
        const person = fullPersonFactory.build({ isRestricted: false })

        expect(displayName(person)).toEqual(person.name)
      })

      it('returns the name prefixed with "LAO:" if restricted', () => {
        const person = fullPersonFactory.build({ isRestricted: true })

        expect(displayName(person)).toEqual(`LAO: ${person.name}`)
      })

      it('returns the name suffixed with "(Limited access offender)" if restricted and LAO as suffix specified', () => {
        const person = fullPersonFactory.build({ isRestricted: true })

        expect(displayName(person, { laoSuffix: true })).toEqual(`${person.name} (Limited access offender)`)
      })
    })

    describe('with a Full Person Summary', () => {
      it('returns the name if not restricted', () => {
        const person = fullPersonSummaryFactory.build({ isRestricted: false })

        expect(displayName(person)).toEqual(person.name)
      })

      describe('with a restricted person', () => {
        it('returns the name prefixed with "LAO:" by default', () => {
          const person = fullPersonSummaryFactory.build({ isRestricted: true })

          expect(displayName(person)).toEqual(`LAO: ${person.name}`)
        })

        it('returns the name suffixed with " (Limited access offender)" if specified', () => {
          const person = fullPersonSummaryFactory.build({ isRestricted: true })

          expect(displayName(person, { laoSuffix: true })).toEqual(`${person.name} (Limited access offender)`)
        })

        it('returns the name with no prefix or suffix', () => {
          const person = fullPersonSummaryFactory.build({ isRestricted: true })

          expect(displayName(person, { laoPrefix: false })).toEqual(person.name)
        })
      })
    })

    describe('with a Restricted Person', () => {
      const person = restrictedPersonFactory.build()

      it('returns "Limited Access Offender" without CRN', () => {
        expect(displayName(person)).toEqual('Limited Access Offender')
      })

      it('returns "LAO: {crn}" with CRN', () => {
        expect(displayName(person, { showCrn: true })).toEqual(`LAO: ${person.crn}`)
      })
    })

    describe('with a Restricted Person Summary', () => {
      const person = restrictedPersonSummaryFactory.build()

      it('returns "Limited Access Offender" without CRN', () => {
        expect(displayName(person)).toEqual('Limited Access Offender')
      })

      it('returns "LAO: {crn}" with CRN', () => {
        expect(displayName(person, { showCrn: true })).toEqual(`LAO: ${person.crn}`)
      })
    })

    describe('with an Unknown Person', () => {
      const person = unknownPersonFactory.build()

      it('returns "Unknown person" without CRN', () => {
        expect(displayName(person)).toEqual('Unknown person')
      })

      it('returns "Unknown: {crn}" with CRN', () => {
        expect(displayName(person, { showCrn: true })).toEqual(`Unknown: ${person.crn}`)
      })
    })

    describe('with an Unknown Person Summary', () => {
      const person = unknownPersonSummaryFactory.build()

      it('returns "Unknown person" without CRN', () => {
        expect(displayName(person)).toEqual('Unknown person')
      })

      it('returns "Unknown: {crn}" with CRN', () => {
        expect(displayName(person, { showCrn: true })).toEqual(`Unknown: ${person.crn}`)
      })
    })
  })

  describe('isUnknownPerson', () => {
    it('returns true if the person is a Unknown person', () => {
      expect(isUnknownPerson(fullPersonFactory.build({ type: 'UnknownPerson' }))).toEqual(true)
    })

    it('returns false if the person is not Unknown person', () => {
      expect(isUnknownPerson(restrictedPersonFactory.build())).toEqual(false)
    })
  })

  describe('personTier', () => {
    let tier: TierDto

    beforeEach(() => {
      tier = tierDtoFactory.build()
    })

    it('returns tier if full person', () => {
      expect(personTier(fullPersonFactory.build({ tier }))).toEqual(tier)
    })

    it('returns tier if full person summary', () => {
      expect(personTier(fullPersonSummaryFactory.build({ tier }))).toEqual(tier)
    })

    it('returns tier if restricted person', () => {
      expect(personTier(restrictedPersonFactory.build({ tier }))).toEqual(tier)
    })

    it('returns tier if restricted person summary', () => {
      expect(personTier(restrictedPersonSummaryFactory.build({ tier }))).toEqual(tier)
    })

    it('returns undefined if unknown person', () => {
      expect(personTier(unknownPersonFactory.build())).toEqual(undefined)
    })

    it('returns undefined if unknown person summary', () => {
      expect(personTier(unknownPersonSummaryFactory.build())).toEqual(undefined)
    })
  })

  describe('getTierOrBlank', () => {
    it('returns the tier badge when a tier is present', () => {
      expect(getTierOrBlank('A1')).toEqual(tierBadge('A1'))
    })

    it('returns an empty string when undefined', () => {
      expect(getTierOrBlank(undefined)).toEqual('')
    })

    it('returns an empty string when null', () => {
      expect(getTierOrBlank(null)).toEqual('')
    })
  })

  describe('getVersionedTierOrBlank', () => {
    const tierOnApplicationCreation = { level: 'static' } as RiskTier

    afterEach(() => {
      config.flags.useLiveTiers = false
    })

    describe('when live tiers are disabled', () => {
      beforeEach(() => {
        config.flags.useLiveTiers = false
      })

      it('returns the tier badge from application creation when present', () => {
        const person = fullPersonFactory.build({ tier: tierDtoFactory.v2().build({ tierScore: 'live' }) })

        expect(getVersionedTierOrBlank(person, tierOnApplicationCreation)).toEqual(tierBadge('static'))
      })

      it('returns an empty string when the application tier is undefined', () => {
        const person = fullPersonFactory.build({ tier: tierDtoFactory.v2().build({ tierScore: 'live' }) })

        expect(getVersionedTierOrBlank(person, undefined)).toEqual('')
      })
    })

    describe('when live tiers are enabled', () => {
      beforeEach(() => {
        config.flags.useLiveTiers = true
      })

      it('returns the badge for the person tier when present', () => {
        const tier = tierDtoFactory.v2().build({ tierScore: 'live' })
        const person = fullPersonFactory.build({ tier })

        expect(getVersionedTierOrBlank(person, tierOnApplicationCreation)).toEqual(versionedTierBadge(tier))
      })

      it('returns an empty string when the person tier is undefined', () => {
        const person = fullPersonFactory.build({ tier: undefined })

        expect(getVersionedTierOrBlank(person, tierOnApplicationCreation)).toEqual('')
      })
    })
  })
})

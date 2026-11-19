import { TierDto } from '@approved-premises/api'
import { personFactory, tierEnvelopeFactory } from '../testutils/factories'
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
  getVersionedTierOrBlank,
  getVersionedTierValue,
  isApplicableTierDto,
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
    it.each(['A', 'B'])('returns the correct tier badge for tier %s', tier => {
      expect(tierBadge(tier)).toEqual(`<span>${tier}</span>`)
    })
  })

  describe('versionedTierBadge', () => {
    it.each(['A', 'B', 'C'])(
      'returns the correct, consistently coloured tiers badges for version 3 tiers "%s"',
      tier => {
        expect(versionedTierBadge(tierDtoFactory.build({ tierScore: tier }))).toEqual(`<span>${tier}</span>`)
      },
    )
  })

  describe('isApplicableTierDto', () => {
    it.each([
      ['Male', 'A', true],
      ['Female', 'A', true],
      ['Male', 'C', true],
      ['Female', 'C', true],
      ['Male', 'D', false],
      ['Female', 'D', true],
      ['Male', 'E', false],
      ['Female', 'E', false],
      ['Male', 'G', false],
      ['Female', 'G', false],
      ['Male', 'MISSING', false],
      ['Female', 'NOT_SUPERVISED', false],
    ])('for sex:%s, tier:%s returns %s', (sex, tierScore, result) => {
      const person = fullPersonFactory.build({ tier: tierDtoFactory.build({ tierScore }), sex })
      expect(isApplicableTierDto(person)).toBe(result)
    })
  })

  describe('isFullPerson', () => {
    it('returns true if the person is a full person', () => {
      expect(isFullPerson(fullPersonFactory.build())).toEqual(true)
    })

    it('returns true if the person summary is a full person summary', () => {
      expect(isFullPerson(fullPersonSummaryFactory.build())).toEqual(true)
    })

    it('returns false if the person is a restricted person', () => {
      expect(isFullPerson(restrictedPersonFactory.build())).toEqual(false)
    })

    it('returns false if the person summary is a restricted person summary', () => {
      expect(isFullPerson(restrictedPersonSummaryFactory.build())).toEqual(false)
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

  describe('getVersionedTierOrBlank', () => {
    describe('when live tiers are enabled', () => {
      beforeEach(() => {
        config.flags.useLiveTiers = true
      })

      it('returns the badge for the person tier when present', () => {
        const tier = tierDtoFactory.build({ tierScore: 'live' })
        const person = fullPersonFactory.build({ tier })

        expect(getVersionedTierOrBlank(person)).toEqual(versionedTierBadge(tier))
      })

      it('returns an empty string when the person tier is undefined', () => {
        const person = fullPersonFactory.build({ tier: undefined })

        expect(getVersionedTierOrBlank(person)).toEqual('')
      })
    })
  })

  describe('getVersionedTierValue', () => {
    const tierOnApplicationCreation = tierEnvelopeFactory.build({ value: { level: 'static', version: 'V2' } }).value
    const personWithLiveTier = personFactory.build({ tier: tierDtoFactory.build({ tierScore: 'live' }) })

    afterEach(() => {
      config.flags.useLiveTiers = false
    })

    describe('when live tiers are enabled', () => {
      beforeEach(() => {
        config.flags.useLiveTiers = true
      })

      it('returns the live person tier when present', () => {
        expect(getVersionedTierValue(personWithLiveTier, tierOnApplicationCreation)).toEqual('live')
      })

      it('returns an empty string when the person has no tier', () => {
        const personWithoutTier = personFactory.build({ tier: undefined })

        expect(getVersionedTierValue(personWithoutTier, tierOnApplicationCreation)).toEqual('')
      })
    })
  })
})

import { TierDto } from '@approved-premises/api'
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
  isApplicableTier,
  isFullPerson,
  isNotRestrictedPerson,
  isUnknownPerson,
  personTier,
  tierBadge,
  versionedTierBadge,
} from './personUtils'
import tierDtoFactory from '../testutils/factories/tierDto'

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
})

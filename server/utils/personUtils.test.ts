import {
  fullPersonFactory,
  fullPersonSummaryFactory,
  restrictedPersonFactory,
  restrictedPersonSummaryFactory,
  unknownPersonSummaryFactory,
} from '../testutils/factories/person'
import {
  isApplicableTier,
  isFullPerson,
  isUnknownPerson,
  laoName,
  laoSummaryName,
  nameOrPlaceholderCopy,
  tierBadge,
} from './personUtils'

describe('personUtils', () => {
  describe('tierBadge', () => {
    it('returns the correct tier badge for A', () => {
      expect(tierBadge('A')).toEqual('<span class="moj-badge moj-badge--red">A</span>')
    })

    it('returns the correct tier badge for B', () => {
      expect(tierBadge('B')).toEqual('<span class="moj-badge moj-badge--purple">B</span>')
    })
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

  describe('laoName', () => {
    it('if the person is not restricted it returns their name', () => {
      const person = fullPersonFactory.build({ isRestricted: false })

      expect(laoName(person)).toEqual(person.name)
    })

    it('if the person is restricted it returns their name prefixed with LAO: ', () => {
      const person = fullPersonFactory.build({ isRestricted: true })

      expect(laoName(person)).toEqual(`LAO: ${person.name}`)
    })
  })

  describe('laoSummaryName', () => {
    it('if the person is not restricted it returns their name', () => {
      const person = fullPersonSummaryFactory.build({ isRestricted: false })

      expect(laoSummaryName(person)).toEqual(person.name)
    })

    it('if the person is restricted but the API returns a full person summary, it returns their name prefixed with LAO:', () => {
      const person = fullPersonSummaryFactory.build({ isRestricted: true })

      expect(laoSummaryName(person)).toEqual(`LAO: ${person.name}`)
    })

    it('if the person is restricted and the API returns a restrictedPersonSummary, it returns LAO ', () => {
      const person = restrictedPersonSummaryFactory.build()

      expect(laoSummaryName(person)).toEqual(`LAO`)
    })

    it('if the person is unknown and the API returns an unknownPersonSummary, it returns Unknown ', () => {
      const person = unknownPersonSummaryFactory.build()

      expect(laoSummaryName(person)).toEqual(`Unknown`)
    })
  })

  describe('nameOrPlaceholderCopy', () => {
    it('returns "the person" if passed a restrictedPerson', () => {
      expect(nameOrPlaceholderCopy(restrictedPersonFactory.build())).toEqual('the person')
    })
    it('returns the persons name if passed a fullPerson', () => {
      const person = fullPersonFactory.build()
      expect(nameOrPlaceholderCopy(person)).toContain(person.name)
    })

    it('includes limited access offender text if showLaoLabel true and person is restricted to others', () => {
      const person = fullPersonFactory.build({ isRestricted: true })
      expect(nameOrPlaceholderCopy(person, 'the person', true)).toEqual(`${person.name} (Limited access offender)`)
    })

    it('does not include limited access offender text if showLaoLabel true and person is not restricted to others', () => {
      const person = fullPersonFactory.build({ isRestricted: false })
      expect(nameOrPlaceholderCopy(person, 'the person', true)).toEqual(person.name)
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
})

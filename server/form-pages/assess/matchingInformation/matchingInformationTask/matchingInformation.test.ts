import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import MatchingInformation from './matchingInformation'

const defaultArguments = {
  apGender: 'female',
  apType: 'esap',
  wheelchairAccessible: 'essential',
  mentalHealthSupport: '1',
  singleRoom: 'essential',
  adaptedForHearingImpairments: 'essential',
  adaptedForVisualImpairments: 'essential',
  adaptedForRestrictedMobility: 'essential',
  cateringRequired: 'essential',
  recoveryFocused: 'essential',
  arsonRoom: 'essential',
  contactSexualOffencesAgainstAnAdultAdults: 'relevant',
  nonContactSexualOffencesAgainstAnAdultAdults: 'relevant',
  contactSexualOffencesAgainstChildren: 'relevant',
  nonContactSexualOffencesAgainstChildren: 'relevant',
  nonSexualOffencesAgainstChildren: 'relevant',
  arsonOffences: 'relevant',
  hateBasedOffences: 'relevant',
  vulnerableToExploitation: 'relevant',
} as const

describe('MatchingInformation', () => {
  describe('title', () => {
    expect(new MatchingInformation(defaultArguments).title).toBe('Matching information')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new MatchingInformation(defaultArguments)

      expect(page.body).toEqual(defaultArguments)
    })
  })

  itShouldHaveNextValue(new MatchingInformation(defaultArguments), '')

  itShouldHavePreviousValue(new MatchingInformation(defaultArguments), 'dashboard')

  describe('errors', () => {
    it('should have an error if there is no answers', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const page = new MatchingInformation({} as any)

      expect(page.errors()).toEqual({
        adaptedForHearingImpairments: 'You must specify a preference for adapted for hearing impairments',
        adaptedForRestrictedMobility: 'You must specify a preference for adapted for restricted mobility',
        adaptedForVisualImpairments: 'You must specify a preference for adapted for visual impairments',
        apGender: 'You must select the gender of AP required',
        apType: 'You must select the type of AP required',
        arsonOffences: 'You must specify if arson offences is relevant',
        cateringRequired: 'You must specify a preference for catering required',
        recoveryFocused: 'You must specify a preference for recovery focused',
        arsonRoom: 'You must specify a preference for arson room',
        contactSexualOffencesAgainstAnAdultAdults:
          'You must specify if contact sexual offences against an adult adults is relevant',
        contactSexualOffencesAgainstChildren:
          'You must specify if contact sexual offences against children is relevant',
        hateBasedOffences: 'You must specify if hate based offences is relevant',
        nonContactSexualOffencesAgainstAnAdultAdults:
          'You must specify if non contact sexual offences against an adult adults is relevant',
        nonContactSexualOffencesAgainstChildren:
          'You must specify if non contact sexual offences against children is relevant',
        nonSexualOffencesAgainstChildren: 'You must specify if non sexual offences against children is relevant',
        singleRoom: 'You must specify a preference for single room',
        vulnerableToExploitation: 'You must specify if vulnerable to exploitation is relevant',
        wheelchairAccessible: 'You must specify a preference for wheelchair accessible',
      })
    })
  })

  describe('response', () => {
    it('returns the response', () => {
      const page = new MatchingInformation({ ...defaultArguments })

      expect(page.response()).toEqual({
        'What type of AP is required?': 'Enhanced Security AP (ESAP)',
        'Which gender AP is required?': 'Female',
        'If this person requires specialist mental health support, select the box below':
          'Semi-specialist mental health selected',
        'Wheelchair accessible': 'Essential',
        'Single room': 'Essential',
        'Adapted for hearing impairments': 'Essential',
        'Adapted for restricted mobility': 'Essential',
        'Adapted for visual impairments': 'Essential',
        'Catering required': 'Essential',
        'Recovery focused': 'Essential',
        'Arson room': 'Essential',
        'Arson offences': 'Relevant',
        'Contact sexual offences against an adult adults': 'Relevant',
        'Contact sexual offences against children': 'Relevant',
        'Hate based offences': 'Relevant',
        'Non contact sexual offences against an adult adults': 'Relevant',
        'Non contact sexual offences against children': 'Relevant',
        'Non sexual offences against children': 'Relevant',
        'Vulnerable to exploitation': 'Relevant',
      })
    })
  })
})

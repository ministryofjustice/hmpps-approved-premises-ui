import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import MatchingInformation, { MatchingInformationBody } from './matchingInformation'

const defaultArguments = {
  apType: 'isEsap' as const,
  accessibilityCriteria: ['hasHearingLoop'],
  specialistSupportCriteria: ['isSemiSpecialistMentalHealth', 'isRecoveryFocussed'],
  isArsonDesignated: 'essential',
  isWheelchairDesignated: 'essential',
  isSingleRoom: 'desirable',
  isStepFreeDesignated: 'desirable',
  isCatered: 'notRelevant',
  isGroundFloor: 'notRelevant',
  hasEnSuite: 'notRelevant',
  isSuitableForVulnerable: 'relevant',
  acceptsSexOffenders: 'relevant',
  acceptsChildSexOffenders: 'relevant',
  acceptsNonSexualChildOffenders: 'relevant',
  acceptsHateCrimeOffenders: 'relevant',
  isArsonSuitable: 'relevant',
  isSuitedForSexOffenders: 'relevant',
} as MatchingInformationBody

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
      const page = new MatchingInformation({})

      expect(page.errors()).toEqual({
        apType: 'You must select the type of AP required',
        isWheelchairDesignated: 'You must specify a preference for wheelchair accessible',
        isSingleRoom: 'You must specify a preference for single room',
        isArsonDesignated: 'You must specify a preference for designated arson room',
        isStepFreeDesignated: 'You must specify a preference for has step-free access',
        isCatered: 'You must specify a preference for catering required',
        isGroundFloor: 'You must specify a preference for ground floor room',
        hasEnSuite: 'You must specify a preference for en suite',
        isSuitableForVulnerable: 'You must specify if vulnerable to exploitation is relevant',
        acceptsSexOffenders: 'You must specify if sexual offences against an adult is relevant',
        acceptsChildSexOffenders: 'You must specify if sexual offences against children is relevant',
        acceptsNonSexualChildOffenders: 'You must specify if non sexual offences against children is relevant',
        acceptsHateCrimeOffenders: 'You must specify if hate based offences is relevant',
        isSuitedForSexOffenders: 'You must specify a preference for is suited for sex offenders',
        isArsonSuitable: 'You must specify if arson offences is relevant',
      })
    })
  })

  describe('response', () => {
    it('returns the response', () => {
      const page = new MatchingInformation({ ...defaultArguments })

      expect(page.response()).toEqual({
        'What type of AP is required?': 'Enhanced Security AP (ESAP)',
        'Accessibility needs': 'Hearing loop',
        'Is arson designated': 'Essential',
        'Is suited for sex offenders': 'Relevant',
        'Is wheelchair designated': 'Essential',
        'Is single room': 'Desirable',
        'Is step free designated': 'Desirable',
        'Is catered': 'Not relevant',
        'Is ground floor': 'Not relevant',
        'Has en suite': 'Not relevant',
        'Is suitable for vulnerable': 'Relevant',
        'Accepts sex offenders': 'Relevant',
        'Accepts child sex offenders': 'Relevant',
        'Accepts non sexual child offenders': 'Relevant',
        'Accepts hate crime offenders': 'Relevant',
        'Is arson suitable': 'Relevant',
        'Specialist support needs': 'Semi-specialist mental health, Recovery Focused Approved Premises (RAP)',
      })
    })

    it('returns none if accessiblity or specialist support needs are not selected', () => {
      const page = new MatchingInformation({
        ...defaultArguments,
        accessibilityCriteria: [],
        specialistSupportCriteria: [],
      })

      const response = page.response()

      expect(response['Accessibility needs']).toEqual('None')
      expect(response['Specialist support needs']).toEqual('None')
    })
  })
})

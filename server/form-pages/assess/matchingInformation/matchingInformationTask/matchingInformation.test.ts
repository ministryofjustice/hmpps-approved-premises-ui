import { placementDurationFromApplication } from '../../../../utils/assessments/placementDurationFromApplication'
import { assessmentFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import MatchingInformation, { MatchingInformationBody } from './matchingInformation'

jest.mock('../../../../utils/assessments/placementDurationFromApplication')

const assessment = assessmentFactory.build()

const defaultArguments = {
  apType: 'isESAP' as const,
  accessibilityCriteria: ['hasHearingLoop'],
  specialistSupportCriteria: ['isSemiSpecialistMentalHealth', 'isRecoveryFocussed'],
  isArsonDesignated: 'essential',
  isWheelchairDesignated: 'essential',
  isSingle: 'desirable',
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
  lengthOfStayAgreed: 'yes',
  cruInformation: 'Some info',
} as MatchingInformationBody

describe('MatchingInformation', () => {
  describe('title', () => {
    expect(new MatchingInformation(defaultArguments, assessment).title).toBe('Matching information')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new MatchingInformation(defaultArguments, assessment)

      expect(page.body).toEqual(defaultArguments)
    })

    it('should return accessibilityCriteria and specialistSupportCriteria as arrays if strings are provided', () => {
      const page = new MatchingInformation(
        {
          ...defaultArguments,
          accessibilityCriteria: 'hasHearingLoop',
          specialistSupportCriteria: 'isSemiSpecialistMentalHealth',
        } as unknown as MatchingInformationBody,
        assessment,
      )

      expect(page.body.accessibilityCriteria).toEqual(['hasHearingLoop'])
      expect(page.body.specialistSupportCriteria).toEqual(['isSemiSpecialistMentalHealth'])
    })

    it('should return empty arrays for accessibilityCriteria and specialistSupportCriteria as arrays if no data is provided', () => {
      const page = new MatchingInformation(
        {
          ...defaultArguments,
          accessibilityCriteria: undefined,
          specialistSupportCriteria: undefined,
        } as unknown as MatchingInformationBody,
        assessment,
      )

      expect(page.body.accessibilityCriteria).toEqual([])
      expect(page.body.specialistSupportCriteria).toEqual([])
    })
  })

  itShouldHaveNextValue(new MatchingInformation(defaultArguments, assessment), '')

  itShouldHavePreviousValue(new MatchingInformation(defaultArguments, assessment), 'dashboard')

  describe('errors', () => {
    it('should have an error if there is no answers', () => {
      const page = new MatchingInformation({}, assessment)

      expect(page.errors()).toEqual({
        apType: 'You must select the type of AP required',
        isWheelchairDesignated: 'You must specify a preference for wheelchair accessible',
        isSingle: 'You must specify a preference for single room',
        isArsonDesignated: 'You must specify a preference for designated arson room',
        isStepFreeDesignated: 'You must specify a preference for step-free access',
        isCatered: 'You must specify a preference for catering required',
        isGroundFloor: 'You must specify a preference for ground floor room',
        hasEnSuite: 'You must specify a preference for en-suite bathroom',
        isSuitableForVulnerable: 'You must specify if vulnerable to exploitation is relevant',
        acceptsSexOffenders: 'You must specify if sexual offences against an adult is relevant',
        acceptsChildSexOffenders: 'You must specify if sexual offences against children is relevant',
        acceptsNonSexualChildOffenders: 'You must specify if non sexual offences against children is relevant',
        acceptsHateCrimeOffenders: 'You must specify if hate based offences is relevant',
        isSuitedForSexOffenders: 'You must specify a preference for room suitable for a person with sexual offences',
        isArsonSuitable: 'You must specify if arson offences is relevant',
        lengthOfStayAgreed: 'You must state if you agree with the length of the stay',
      })
    })

    it('should add an error if lengthOfStayAgreed is no and the details are not provided', () => {
      const page = new MatchingInformation({ ...defaultArguments, lengthOfStayAgreed: 'no' }, assessment)

      expect(page.errors()).toEqual({
        lengthOfStayAgreedDetail: 'You must provide a recommended length of stay',
      })
    })
  })

  describe('response', () => {
    it('returns the response', () => {
      const page = new MatchingInformation({ ...defaultArguments }, assessment)

      expect(page.response()).toEqual({
        'What type of AP is required?': 'Enhanced Security AP (ESAP)',
        'Accessibility needs': 'Hearing loop',
        'Designated arson room': 'Essential',
        'Room suitable for a person with sexual offences': 'Relevant',
        'Wheelchair accessible': 'Essential',
        'Single room': 'Desirable',
        'Step-free access': 'Desirable',
        'Catering required': 'Not relevant',
        'Ground floor room': 'Not relevant',
        'En-suite bathroom': 'Not relevant',
        'Vulnerable to exploitation': 'Relevant',
        'Sexual offences against an adult': 'Relevant',
        'Sexual offences against children': 'Relevant',
        'Non sexual offences against children': 'Relevant',
        'Hate based offences': 'Relevant',
        'Arson offences': 'Relevant',
        'Specialist support needs': 'Semi-specialist mental health, Recovery Focused Approved Premises (RFAP)',
        'Do you agree with the suggested length of stay?': 'Yes',
        'Information for Central Referral Unit (CRU) manager': 'Some info',
      })
    })

    it('returns none if accessiblity or specialist support needs are not selected', () => {
      const page = new MatchingInformation(
        {
          ...defaultArguments,
          accessibilityCriteria: [],
          specialistSupportCriteria: [],
        },
        assessment,
      )

      const response = page.response()

      expect(response['Accessibility needs']).toEqual('None')
      expect(response['Specialist support needs']).toEqual('None')
    })

    it('adds the recommended length of stay if lengthOfStayAgreed is no', () => {
      const page = new MatchingInformation(
        {
          ...defaultArguments,
          lengthOfStayAgreed: 'no',
          lengthOfStayAgreedDetail: '12',
        },
        assessment,
      )

      const response = page.response()

      expect(response['Do you agree with the suggested length of stay?']).toEqual('No')
      expect(response['Recommended length of stay']).toEqual('12 weeks')
    })
  })

  describe('specialistSupportCheckboxes', () => {
    it('returns an array of checkboxes with chosen options selected', () => {
      const page = new MatchingInformation(
        { ...defaultArguments, specialistSupportCriteria: ['isRecoveryFocussed'] },
        assessment,
      )

      expect(page.specialistSupportCheckboxes).toEqual([
        {
          value: 'isRecoveryFocussed',
          text: 'Recovery Focused Approved Premises (RFAP)',
          checked: true,
        },
        {
          value: 'isSemiSpecialistMentalHealth',
          text: 'Semi-specialist mental health',
          checked: false,
        },
      ])
    })
  })

  describe('accessibilityCheckBoxes', () => {
    it('returns an array of checkboxes with chosen options selected', () => {
      const page = new MatchingInformation(
        { ...defaultArguments, accessibilityCriteria: ['hasBrailleSignage'] },
        assessment,
      )

      expect(page.accessibilityCheckBoxes).toEqual([
        {
          value: 'hasBrailleSignage',
          text: 'Braille signage',
          checked: true,
        },
        {
          value: 'hasTactileFlooring',
          text: 'Tactile flooring',
          checked: false,
        },
        { value: 'hasHearingLoop', text: 'Hearing loop', checked: false },
      ])
    })
  })

  describe('suggestedLengthOfStay', () => {
    it('returns the suggested length of stay from the application', () => {
      const page = new MatchingInformation(defaultArguments, assessment)

      ;(placementDurationFromApplication as jest.Mock).mockReturnValueOnce(12)

      expect(page.suggestedLengthOfStay).toEqual('1 week, 5 days')

      expect(placementDurationFromApplication).toHaveBeenCalledWith(assessment.application)
    })
  })
})

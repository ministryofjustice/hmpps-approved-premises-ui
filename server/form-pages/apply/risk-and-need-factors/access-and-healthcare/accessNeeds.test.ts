import { YesOrNo } from '@approved-premises/ui'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import AccessNeeds, { AdditionalNeed, additionalNeeds, furtherAccessNeedsQuestionsNeeded } from './accessNeeds'

import { applicationFactory, personFactory, restrictedPersonFactory } from '../../../../testutils/factories'
import { convertKeyValuePairToCheckBoxItems } from '../../../../utils/formUtils'

describe('AccessNeeds', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  describe('title', () => {
    expect(new AccessNeeds({}, application).title).toBe('Access, cultural and healthcare needs')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new AccessNeeds(
        {
          additionalNeeds: 'mobility' as unknown as Array<AdditionalNeed>,
          careActAssessmentCompleted: 'yes',
          interpreterLanguage: 'french',
          needsInterpreter: 'no',
          religiousOrCulturalNeeds: 'Yes' as YesOrNo,
          religiousOrCulturalNeedsDetail: 'Some details',
          careAndSupportNeeds: 'yes',
          careAndSupportNeedsDetail: 'Some more details',
        },
        application,
      )
      expect(page.body).toEqual({
        additionalNeeds: ['mobility'],
        careActAssessmentCompleted: 'yes',
        interpreterLanguage: 'french',
        needsInterpreter: 'no',
        religiousOrCulturalNeeds: 'Yes',
        religiousOrCulturalNeedsDetail: 'Some details',
        careAndSupportNeeds: 'yes',
        careAndSupportNeedsDetail: 'Some more details',
      })
    })
  })

  describe('questions', () => {
    it('returns the questions with the persons name if it is present', () => {
      expect(new AccessNeeds({}, application).questions).toEqual({
        careActAssessmentCompleted: 'Has a care act assessment been completed?',
        careAndSupportNeeds: {
          hint: 'Provide details',
          question: 'Does this person have care and support needs?',
        },
        interpreter: {
          language: 'Which language is an interpreter needed for?',
          question: 'Does John Wayne need an interpreter?',
        },
        needs: {
          hint: 'For example, if John Wayne has a visual impairment, uses a hearing aid or has an ADHD diagnosis.',
          question: 'Does John Wayne have any of the following needs?',
        },
        religiousOrCulturalNeeds: {
          furtherDetails: 'Details of religious or cultural needs',
          question: 'Does John Wayne have any religious or cultural needs?',
        },
      })
    })

    it('returns the questions with the "the person" if the applicant is a restricted person', () => {
      const restrictedPerson = restrictedPersonFactory.build()

      expect(new AccessNeeds({}, { ...application, person: restrictedPerson }).questions).toEqual({
        careActAssessmentCompleted: 'Has a care act assessment been completed?',
        careAndSupportNeeds: {
          hint: 'Provide details',
          question: 'Does this person have care and support needs?',
        },
        interpreter: {
          language: 'Which language is an interpreter needed for?',
          question: 'Does the person need an interpreter?',
        },
        needs: {
          hint: 'For example, if the person has a visual impairment, uses a hearing aid or has an ADHD diagnosis.',
          question: 'Does the person have any of the following needs?',
        },
        religiousOrCulturalNeeds: {
          furtherDetails: 'Details of religious or cultural needs',
          question: 'Does the person have any religious or cultural needs?',
        },
      })
    })
  })

  describe('when the reponse contains "mobility"', () => {
    itShouldHaveNextValue(
      new AccessNeeds({ additionalNeeds: ['mobility'] }, application),
      'access-needs-further-questions',
    )
  })

  describe('when the reponse contains "pregnancy"', () => {
    itShouldHaveNextValue(
      new AccessNeeds({ additionalNeeds: ['pregnancy'] }, application),
      'access-needs-further-questions',
    )
  })

  describe('when the reponse contains "visualImpairment"', () => {
    itShouldHaveNextValue(
      new AccessNeeds({ additionalNeeds: ['visualImpairment'] }, application),
      'access-needs-further-questions',
    )
  })

  describe('when the response contains an answer other than "none"', () => {
    itShouldHaveNextValue(new AccessNeeds({ additionalNeeds: ['healthcare'] }, application), 'covid')
  })

  itShouldHavePreviousValue(new AccessNeeds({}, application), 'dashboard')

  describe('errors', () => {
    it('returns the correct errors when responses are missing', () => {
      const page = new AccessNeeds({}, application)

      expect(page.errors()).toEqual({
        careActAssessmentCompleted: 'You must confirm whether a care act assessment has been completed',
        needsInterpreter: 'You must confirm the need for an interpreter',
        religiousOrCulturalNeeds: 'You must confirm whether John Wayne has any religious or cultural needs',
        additionalNeeds: 'You must confirm whether John Wayne has any additional needs',
        careAndSupportNeeds: 'You must confirm whether John Wayne has care and support needs',
      })
    })
    it('if careAndSupportNeeds answer is yes then additional details must be given', () => {
      const page = new AccessNeeds(
        {
          additionalNeeds: ['mobility'],
          careActAssessmentCompleted: 'yes',
          interpreterLanguage: 'french',
          needsInterpreter: 'no',
          religiousOrCulturalNeeds: 'Yes' as YesOrNo,
          religiousOrCulturalNeedsDetail: 'Some details',
        },
        application,
      )

      expect(page.errors()).toEqual({
        careAndSupportNeeds: 'You must confirm whether John Wayne has care and support needs',
      })
    })
  })

  describe('response', () => {
    it('returns the correct plain english responses for the questions', () => {
      const page = new AccessNeeds(
        {
          additionalNeeds: ['mobility', 'visualImpairment'],
          needsInterpreter: 'yes',
          interpreterLanguage: 'French',
          religiousOrCulturalNeeds: 'yes',
          religiousOrCulturalNeedsDetail: 'Some details',
          careActAssessmentCompleted: 'yes',
          careAndSupportNeeds: 'yes',
          careAndSupportNeedsDetail: 'some details',
        },
        application,
      )

      expect(page.response()).toEqual({
        'Does John Wayne have any of the following needs?': 'Mobility, visual impairment',
        'Does John Wayne need an interpreter?': 'Yes',
        'Which language is an interpreter needed for?': 'French',
        'Does John Wayne have any religious or cultural needs?': 'Yes - Some details',
        'Does this person have care and support needs?': 'Yes - some details',
        'Has a care act assessment been completed?': 'Yes',
      })
    })
  })

  describe('needsCheckboxes', () => {
    it('calls convertKeyValuePairToCheckBoxItems with the correct arguments', () => {
      const page = new AccessNeeds({ additionalNeeds: ['mobility', 'neurodivergentConditions'] }, application)

      expect(page.needsCheckboxes()).toEqual(
        convertKeyValuePairToCheckBoxItems(additionalNeeds, ['mobility', 'neurodivergentConditions']),
      )
    })
  })
})

describe('furtherAccessNeedsQuestionsNeeded', () => {
  it('returns true if array contains specified string', () => {
    expect(furtherAccessNeedsQuestionsNeeded(['pregnancy'])).toBe(true)
  })

  it('returns false if array does not contain specified string', () => {
    expect(furtherAccessNeedsQuestionsNeeded(['healthcare'])).toBe(false)
  })
})

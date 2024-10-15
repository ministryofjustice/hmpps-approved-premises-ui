import { YesOrNo } from '@approved-premises/ui'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import AccessNeeds, { AdditionalNeed, additionalNeeds, furtherAccessNeedsQuestionsNeeded } from './accessNeeds'

import { convertKeyValuePairToCheckBoxItems } from '../../../../utils/formUtils'

describe('AccessNeeds', () => {
  describe('title', () => {
    expect(new AccessNeeds({}).title).toBe('Access, cultural and healthcare needs')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new AccessNeeds({
        additionalNeeds: 'mobility' as unknown as Array<AdditionalNeed>,
        careActAssessmentCompleted: 'yes',
        interpreterLanguage: 'french',
        needsInterpreter: 'no',
        religiousOrCulturalNeeds: 'Yes' as YesOrNo,
        religiousOrCulturalNeedsDetail: 'Some details',
        careAndSupportNeeds: 'yes',
        careAndSupportNeedsDetail: 'Some more details',
      })
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

  describe('when the reponse contains "mobility"', () => {
    itShouldHaveNextValue(new AccessNeeds({ additionalNeeds: ['mobility'] }), 'access-needs-further-questions')
  })

  describe('when the reponse contains "pregnancy"', () => {
    itShouldHaveNextValue(new AccessNeeds({ additionalNeeds: ['pregnancy'] }), 'access-needs-further-questions')
  })

  describe('when the reponse contains "visualImpairment"', () => {
    itShouldHaveNextValue(new AccessNeeds({ additionalNeeds: ['visualImpairment'] }), 'access-needs-further-questions')
  })

  describe('when the response contains an answer other than "none"', () => {
    itShouldHaveNextValue(new AccessNeeds({ additionalNeeds: ['healthcare'] }), 'covid')
  })

  itShouldHavePreviousValue(new AccessNeeds({}), 'dashboard')

  describe('errors', () => {
    it('returns the correct errors when responses are missing', () => {
      const page = new AccessNeeds({})

      expect(page.errors()).toEqual({
        careActAssessmentCompleted: 'You must confirm whether a care act assessment has been completed',
        needsInterpreter: 'You must confirm the need for an interpreter',
        religiousOrCulturalNeeds: 'You must confirm whether the person has any religious or cultural needs',
        additionalNeeds: 'You must confirm whether the person has any additional needs',
        careAndSupportNeeds: 'You must confirm whether the person has care and support needs',
      })
    })
    it('if careAndSupportNeeds answer is yes then additional details must be given', () => {
      const page = new AccessNeeds({
        additionalNeeds: ['mobility'],
        careActAssessmentCompleted: 'yes',
        interpreterLanguage: 'french',
        needsInterpreter: 'no',
        religiousOrCulturalNeeds: 'Yes' as YesOrNo,
        religiousOrCulturalNeedsDetail: 'Some details',
      })

      expect(page.errors()).toEqual({
        careAndSupportNeeds: 'You must confirm whether the person has care and support needs',
      })
    })
  })

  describe('response', () => {
    it('returns the correct plain english responses for the questions', () => {
      const page = new AccessNeeds({
        additionalNeeds: ['mobility', 'visualImpairment'],
        needsInterpreter: 'yes',
        interpreterLanguage: 'French',
        religiousOrCulturalNeeds: 'yes',
        religiousOrCulturalNeedsDetail: 'Some details',
        careActAssessmentCompleted: 'yes',
        careAndSupportNeeds: 'yes',
        careAndSupportNeedsDetail: 'some details',
      })

      expect(page.response()).toEqual({
        'Does the person have any of the following needs?': 'Mobility, visual impairment',
        'Does the person need an interpreter?': 'Yes',
        'Which language is an interpreter needed for?': 'French',
        'Does the person have any religious or cultural needs?': 'Yes - Some details',
        'Does this person have care and support needs?': 'Yes - some details',
        'Has a care act assessment been completed?': 'Yes',
      })
    })
  })

  describe('needsCheckboxes', () => {
    it('calls convertKeyValuePairToCheckBoxItems with the correct arguments', () => {
      const page = new AccessNeeds({ additionalNeeds: ['mobility', 'neurodivergentConditions'] })

      expect(page.needsCheckboxes()).toEqual(
        convertKeyValuePairToCheckBoxItems(additionalNeeds, ['mobility', 'neurodivergentConditions'], true),
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

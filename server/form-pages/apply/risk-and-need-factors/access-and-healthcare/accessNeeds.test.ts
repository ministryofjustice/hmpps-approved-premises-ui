import { YesOrNo } from '@approved-premises/ui'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import AccessNeeds, { additionalNeeds } from './accessNeeds'

import { applicationFactory, personFactory } from '../../../../testutils/factories'
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
          additionalNeeds: 'mobility',
          careActAssessmentCompleted: 'yes',
          interpreterLanguage: 'french',
          needsInterpreter: 'no',
          religiousOrCulturalNeeds: 'Yes' as YesOrNo,
          religiousOrCulturalNeedsDetails: 'Some details',
        },
        application,
      )
      expect(page.body).toEqual({
        additionalNeeds: ['mobility'],
        careActAssessmentCompleted: 'yes',
        interpreterLanguage: 'french',
        needsInterpreter: 'no',
        religiousOrCulturalNeeds: 'Yes',
        religiousOrCulturalNeedsDetails: 'Some details',
      })
    })
  })

  describe('when the reponse contains "mobility"', () => {
    itShouldHaveNextValue(new AccessNeeds({ additionalNeeds: ['mobility'] }, application), 'access-needs-mobility')
  })

  describe('when the response contains an answer other than "none"', () => {
    itShouldHaveNextValue(new AccessNeeds({ additionalNeeds: ['visualImpairment'] }, application), 'covid')
  })

  itShouldHavePreviousValue(new AccessNeeds({}, application), 'dashboard')

  describe('errors', () => {
    const page = new AccessNeeds({}, application)

    expect(page.errors()).toEqual({
      careActAssessmentCompleted: 'You must confirm whether a care act assessment has been completed',
      needsInterpreter: 'You must confirm the need for an interpreter',
      religiousOrCulturalNeeds: 'You must confirm whether John Wayne has any religious or cultural needs',
      additionalNeeds: 'You must confirm whether John Wayne has any additional needs',
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
          religiousOrCulturalNeedsDetails: 'Some details',
          careActAssessmentCompleted: 'yes',
        },
        application,
      )

      expect(page.response()).toEqual({
        'Does John Wayne have any of the following needs?': 'Mobility needs, visual impairment',
        'Does John Wayne need an interpreter?': 'Yes',
        'Which language is an interpreter needed for?': 'French',
        'Does John Wayne have any religious or cultural needs?': 'Yes',
        'Details of religious or cultural needs': 'Some details',
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

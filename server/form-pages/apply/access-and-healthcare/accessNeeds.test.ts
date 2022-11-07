import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import AccessNeeds, { additionalNeeds } from './accessNeeds'

import applicationFactory from '../../../testutils/factories/application'
import personFactory from '../../../testutils/factories/person'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'

jest.mock('../../../utils/formUtils')

describe('AccessNeeds', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  describe('title', () => {
    expect(new AccessNeeds({}, application).title).toBe('Access needs')
  })

  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new AccessNeeds(
        {
          additionalNeeds: 'mobility',
          careActAssessmentCompleted: 'yes',
          interpreterLanguage: 'french',
          needsInterpreter: 'no',
          anotherThing: 'here',
          religiousOrCulturalNeeds: 'Yes',
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

  itShouldHaveNextValue(new AccessNeeds({}, application), '')
  itShouldHavePreviousValue(new AccessNeeds({}, application), '')

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
          anotherThing: 'here',
          religiousOrCulturalNeeds: 'Yes',
          religiousOrCulturalNeedsDetails: 'Some details',
          careActAssessmentCompleted: 'yes',
        },
        application,
      )

      expect(page.response()).toEqual({
        'Access needs': {
          'Does John Wayne have any of the following needs?': 'Mobility needs, visual impairment',
          'Does John Wayne need an interpreter?': 'Yes',
          'Which language is an interpreter needed for?': 'French',
          'Does John Wayne have any religious or cultural needs?': 'Yes',
          'Details of religious or cultural needs': 'Some details',
          'Has a care act assessment been completed?': 'Yes',
        },
      })
    })
  })

  describe('needsCheckboxes', () => {
    it('calls convertKeyValuePairToCheckBoxItems with the correct arguments', () => {
      new AccessNeeds({ additionalNeeds: ['mobility', 'neurodivergentConditions'] }, application).needsCheckboxes()

      expect(convertKeyValuePairToCheckBoxItems).toHaveBeenCalledWith(additionalNeeds, [
        'mobility',
        'neurodivergentConditions',
      ])
    })
  })
})

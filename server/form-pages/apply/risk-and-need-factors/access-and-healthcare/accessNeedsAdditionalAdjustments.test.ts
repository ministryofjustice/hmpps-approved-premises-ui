import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import AccessNeedsAdditionalAdjustments from './accessNeedsAdditionalAdjustments'

import applicationFactory from '../../../../testutils/factories/application'
import personFactory from '../../../../testutils/factories/person'
import { ApprovedPremisesApplication, Person } from '../../../../@types/shared'
import { SessionDataError } from '../../../../utils/errors'

describe('AccessNeedsAdditionalAdjustments', () => {
  let application: ApprovedPremisesApplication
  let person: Person
  const previousPage = 'previousPage'

  beforeEach(() => {
    person = personFactory.build({ name: 'John Wayne' })
    application = applicationFactory.build({
      person,
      data: {
        'access-and-healthcare': {
          'access-needs': { additionalNeeds: ['mobility', 'visualImpairment', 'neurodivergentConditions'] },
        },
      },
    })
  })

  describe('title', () => {
    it('has the correct title', () => {
      expect(new AccessNeedsAdditionalAdjustments({}, application, previousPage).title).toBe('Access needs')
    })
  })

  describe('the previous and next page are correct', () => {
    application = applicationFactory.build({
      person,
      data: {
        'access-and-healthcare': {
          'access-needs': { additionalNeeds: ['mobility', 'visualImpairment', 'neurodivergentConditions'] },
        },
      },
    })
    itShouldHaveNextValue(new AccessNeedsAdditionalAdjustments({}, application, previousPage), 'covid')
    itShouldHavePreviousValue(new AccessNeedsAdditionalAdjustments({}, application, previousPage), 'previousPage')
  })
  describe('question', () => {
    it('constructs the correct string when there are multiple needs', () => {
      expect(new AccessNeedsAdditionalAdjustments({}, application, previousPage).questions.adjustments).toBe(
        'Does the placement require adjustments for the mobility, visual impairment and neurodivergent conditions needs you selected?',
      )
    })

    it('constructs the correct string when there is a single need', () => {
      application = applicationFactory.build({
        person,
        data: {
          'access-and-healthcare': {
            'access-needs': { additionalNeeds: ['neurodivergentConditions'] },
          },
        },
      })

      expect(new AccessNeedsAdditionalAdjustments({}, application, previousPage).questions.adjustments).toBe(
        'Does the placement require adjustments for the neurodivergent conditions needs you selected?',
      )
    })

    it('throws an error if the "access-needs" array is empty', () => {
      application = applicationFactory.build({
        person,
        data: {
          'access-and-healthcare': {
            'access-needs': { additionalNeeds: [] },
          },
        },
      })

      expect(() => new AccessNeedsAdditionalAdjustments({}, application, previousPage).questions.adjustments).toThrow(
        new SessionDataError('Access needs additional adjustments error: Error: No additional needs'),
      )
    })

    it('throws an error if the application doesnt have an access needs property', () => {
      application = applicationFactory.build({
        person,
        data: {
          'access-and-healthcare': {},
        },
      })

      expect(() => new AccessNeedsAdditionalAdjustments({}, application, previousPage).questions.adjustments).toThrow(
        new SessionDataError(
          "Access needs additional adjustments error: TypeError: Cannot read properties of undefined (reading 'additionalNeeds')",
        ),
      )
    })
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new AccessNeedsAdditionalAdjustments(
        { adjustments: 'yes', adjustmentsDetail: 'some details' },
        application,
        previousPage,
      )

      expect(page.body).toEqual({
        adjustments: 'yes',
        adjustmentsDetail: 'some details',
      })
    })
  })

  describe('errors', () => {
    const page = new AccessNeedsAdditionalAdjustments({}, application, previousPage)

    expect(page.errors()).toEqual({
      adjustments: 'You must specify whether the placement requires additional adjustments',
    })
  })

  describe('response', () => {
    const page = new AccessNeedsAdditionalAdjustments(
      { adjustments: 'yes', adjustmentsDetail: 'some detail' },
      application,
      previousPage,
    )

    expect(page.response()).toEqual({
      'Does the placement require adjustments for the mobility, visual impairment and neurodivergent conditions needs you selected?':
        'Yes - some detail',
    })
  })
})

import { YesNoOrIDK } from '@approved-premises/ui'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import PreviousPlacements from './previousPlacements'
import { applicationFactory, personFactory } from '../../../../testutils/factories'

describe('PreviousPlacements', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  const body = {
    previousPlacement: 'yes' as YesNoOrIDK,
    previousPlacementDetail: 'Previous placement detail',
  }

  describe('questions', () => {
    it("adds the person's name to the question titles", () => {
      const page = new PreviousPlacements(body, application)

      expect(page.questions).toEqual({
        previousPlacement: 'Has John Wayne stayed or been offered a placement in an AP before?',
      })
    })
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new PreviousPlacements(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHaveNextValue(new PreviousPlacements(body, application), 'complex-case-board')
  itShouldHavePreviousValue(new PreviousPlacements(body, application), 'vulnerability')

  describe('errors', () => {
    it('should return errors when yes/no questions are blank', () => {
      const page = new PreviousPlacements({}, application)

      expect(page.errors()).toEqual({
        previousPlacement: 'You must specify if John Wayne has stayed or been offered a placement in an AP before',
      })
    })

    it('shows errors when a question has a yes response, but the details are left out', () => {
      const page = new PreviousPlacements({ ...body, previousPlacementDetail: '' }, application)

      expect(page.errors()).toEqual({
        previousPlacementDetail:
          'You must specify details about if John Wayne has stayed or been offered a placement in an AP before',
      })
    })
  })

  describe('response', () => {
    it('Adds detail to an answer when the answer is yes', () => {
      const page = new PreviousPlacements(body, application)

      expect(page.response()).toEqual({
        'Has John Wayne stayed or been offered a placement in an AP before?': 'Yes - Previous placement detail',
      })
    })

    it('does not add detail to questions with a no answer', () => {
      const page = new PreviousPlacements({ ...body, previousPlacement: 'no' }, application)

      expect(page.response()).toEqual({
        'Has John Wayne stayed or been offered a placement in an AP before?': 'No',
      })
    })

    it('does not add detail to questions with a iDontKnow answer', () => {
      const page = new PreviousPlacements({ ...body, previousPlacement: 'iDontKnow' }, application)

      expect(page.response()).toEqual({
        'Has John Wayne stayed or been offered a placement in an AP before?': "Don't know",
      })
    })
  })
})

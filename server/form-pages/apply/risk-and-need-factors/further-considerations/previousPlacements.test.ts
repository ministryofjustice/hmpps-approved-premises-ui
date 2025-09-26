import { YesNoOrIDK } from '@approved-premises/ui'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'

import PreviousPlacements from './previousPlacements'

describe('PreviousPlacements', () => {
  const body = {
    previousPlacement: 'yes' as YesNoOrIDK,
    previousPlacementDetail: 'Previous placement detail',
  }

  describe('body', () => {
    it('should set the body', () => {
      const page = new PreviousPlacements(body)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHaveNextValue(new PreviousPlacements(body), 'catering')
  itShouldHavePreviousValue(new PreviousPlacements(body), 'vulnerability')

  describe('errors', () => {
    it('should return errors when yes/no questions are blank', () => {
      const page = new PreviousPlacements({})

      expect(page.errors()).toEqual({
        previousPlacement: 'You must specify if the person has stayed or been offered a placement in an AP before',
      })
    })

    it('shows errors when a question has a yes response, but the details are left out', () => {
      const page = new PreviousPlacements({ ...body, previousPlacementDetail: '' })

      expect(page.errors()).toEqual({
        previousPlacementDetail:
          'You must specify details about if the person has stayed or been offered a placement in an AP before',
      })
    })
  })

  describe('response', () => {
    it('Adds detail to an answer when the answer is yes', () => {
      const page = new PreviousPlacements(body)

      expect(page.response()).toEqual({
        'Has the person stayed or been offered a placement in an AP before?': 'Yes - Previous placement detail',
      })
    })

    it('does not add detail to questions with a no answer', () => {
      const page = new PreviousPlacements({ ...body, previousPlacement: 'no' })

      expect(page.response()).toEqual({
        'Has the person stayed or been offered a placement in an AP before?': 'No',
      })
    })

    it('does not add detail to questions with a iDontKnow answer', () => {
      const page = new PreviousPlacements({ ...body, previousPlacement: 'iDontKnow' })

      expect(page.response()).toEqual({
        'Has the person stayed or been offered a placement in an AP before?': "Don't know",
      })
    })
  })
})

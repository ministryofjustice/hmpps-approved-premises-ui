import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import Catering from './catering'

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')

describe('Catering', () => {
  const body = {
    catering: 'no' as const,
    cateringDetail: 'Catering detail',
  }

  describe('body', () => {
    it('should set the body', () => {
      const page = new Catering(body)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHaveNextValue(new Catering(body), 'arson')
  itShouldHavePreviousValue(new Catering(body), 'previous-placements')

  describe('errors', () => {
    it('should return errors when yes/no questions are blank', () => {
      const page = new Catering({})

      expect(page.errors()).toEqual({
        catering: 'You must specify if the person can be placed in a self-catered Approved Premises (AP)',
      })
    })

    it('shows errors when a question has a no response, but the details are left out', () => {
      const page = new Catering({ ...body, cateringDetail: '' })

      expect(page.errors()).toEqual({
        cateringDetail: 'You must specify details if you have any concerns about the person catering for themselves',
      })
    })
  })

  describe('response', () => {
    it('Adds detail to an answer when the answer is no', () => {
      const page = new Catering(body)

      expect(page.response()).toEqual({
        'Can the person be placed in a self-catered Approved Premises (AP)?': 'No - Catering detail',
      })
    })

    it('does not add detail to questions with a yes answer', () => {
      const page = new Catering({ ...body, catering: 'yes' })

      expect(page.response()).toEqual({
        'Can the person be placed in a self-catered Approved Premises (AP)?': 'Yes',
      })
    })
  })
})

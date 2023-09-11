import { itShouldHaveNextValue } from '../../../shared-examples'

import Catering from './catering'
import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { retrieveQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')

describe('Catering', () => {
  const person = personFactory.build({ name: 'the person' })
  const application = applicationFactory.build({ person })

  const body = {
    catering: 'no' as const,
    cateringDetail: 'Catering detail',
  }

  describe('body', () => {
    it('should set the body', () => {
      const page = new Catering(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHaveNextValue(new Catering(body, application), 'arson')

  describe('previous', () => {
    it('returns rfap if the answer to the rfap question is no', () => {
      ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValueOnce('no')

      expect(new Catering(body, application).previous()).toEqual('rfap')
    })

    it('returns rfap-details if the answer to the rfap question is yes', () => {
      ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValueOnce('yes')

      expect(new Catering(body, application).previous()).toEqual('rfap-details')
    })
  })

  describe('errors', () => {
    it('should return errors when yes/no questions are blank', () => {
      const page = new Catering({}, application)

      expect(page.errors()).toEqual({
        catering: 'You must specify if the person can be placed in a self-catered Approved Premises (AP)',
      })
    })

    it('shows errors when a question has a no response, but the details are left out', () => {
      const page = new Catering({ ...body, cateringDetail: '' }, application)

      expect(page.errors()).toEqual({
        cateringDetail: 'You must specify details if you have any concerns about the person catering for themselves',
      })
    })
  })

  describe('response', () => {
    it('Adds detail to an answer when the answer is no', () => {
      const page = new Catering(body, application)

      expect(page.response()).toEqual({
        'Can the person be placed in a self-catered Approved Premises (AP)?': 'No - Catering detail',
      })
    })

    it('does not add detail to questions with a yes answer', () => {
      const page = new Catering({ ...body, catering: 'yes' }, application)

      expect(page.response()).toEqual({
        'Can the person be placed in a self-catered Approved Premises (AP)?': 'Yes',
      })
    })
  })
})

import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import RfapDetails, { RfapDetailsBody } from './rfapDetails'

const body: RfapDetailsBody = {
  continuedRecovery: 'recovery plans',
  motivation: 'some motivation',
  receivingTreatment: 'yes',
  receivingTreatmentDetail: 'some detail',
}

describe('RfapDetails', () => {
  describe('body', () => {
    it('should set the body', () => {
      const page = new RfapDetails(body)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHaveNextValue(new RfapDetails({}), 'catering')

  itShouldHavePreviousValue(new RfapDetails({}), 'rfap')

  describe('errors', () => {
    it('shows errors when the yes/no questions are blank', () => {
      const page = new RfapDetails({})

      expect(page.errors()).toEqual({
        continuedRecovery:
          'You must state how this person is planning to continue their recovery work whilst in the AP',
        motivation:
          'You must state how this person has demonstrated their motivation to address their substance misuse',
        receivingTreatment:
          'You must state if this person is receiving clinical, medical and/or psychosocial treatment for their substance misuse',
      })
    })
  })

  describe('response', () => {
    it('Adds detail to an answer when the answer is yes', () => {
      const page = new RfapDetails(body)

      expect(page.response()).toEqual({
        'How has the person demonstrated their motivation to address their substance misuse?': 'some motivation',
        'How is the person planning to continue their recovery work whilst in the AP?': 'recovery plans',
        'Is this person receiving clinical, medical and/or psychosocial treatment for their substance misuse?':
          'Yes - some detail',
      })
    })
  })
})

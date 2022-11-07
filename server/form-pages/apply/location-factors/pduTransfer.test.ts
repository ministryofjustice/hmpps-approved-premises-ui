import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import PduTransfer from './pduTransfer'

import applicationFactory from '../../../testutils/factories/application'
import personFactory from '../../../testutils/factories/person'

describe('PduTransfer', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  describe('title', () => {
    expect(new PduTransfer({ transferStatus: '' }, application).title).toBe(
      "Have you agreed John Wayne's transfer/supervision with the receiving PDU?",
    )
  })

  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      expect(
        new PduTransfer({ transferStatus: 'yes', probationPractitioner: 'bob', someProperty: 'bye' }, application).body,
      ).toEqual({ transferStatus: 'yes', probationPractitioner: 'bob' })
    })
  })

  itShouldHaveNextValue(new PduTransfer({}, application), '')
  itShouldHavePreviousValue(new PduTransfer({}, application), 'describe-location-factors')

  describe('errors', () => {
    it('should have an error if no response is submitted', () => {
      expect(new PduTransfer({}, application).errors()).toEqual({
        transferStatus: 'You must choose an answer',
      })
    })

    it('should have an error if the answer is "yes" but no probation practitioner is named', () => {
      expect(new PduTransfer({ transferStatus: 'yes' }, application).errors()).toEqual({
        probationPractitioner: "You must give the probation practitioner's name",
      })
    })
  })

  describe('response', () => {
    it('returns the full copy for the users response if they answer yes', () => {
      const page = new PduTransfer({ transferStatus: 'yes', probationPractitioner: 'Alice' }, application)
      expect(page.response()).toEqual({
        "Have you agreed John Wayne's transfer/supervision with the receiving PDU?": 'Yes',
        'Probation practitioner': 'Alice',
      })
    })

    it('returns the full copy for the users response if they answer noNeedToMakeArrangements', () => {
      const page = new PduTransfer({ transferStatus: 'noNeedToMakeArrangements' }, application)
      expect(page.response()).toEqual({
        "Have you agreed John Wayne's transfer/supervision with the receiving PDU?":
          'No, I still need to make arrangements',
      })
    })

    it('returns the full copy for the users response if they answer noProbationPractitioner', () => {
      const page = new PduTransfer({ transferStatus: 'noProbationPractitioner' }, application)
      expect(page.response()).toEqual({
        "Have you agreed John Wayne's transfer/supervision with the receiving PDU?":
          'No, management and supervision will be maintained by the existing probation practitioner',
      })
    })
  })
})

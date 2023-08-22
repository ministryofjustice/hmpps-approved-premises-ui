import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import PipeOpdScreening from './pipeOpdScreening'
import { applicationFactory } from '../../../../testutils/factories'
import { nameOrPlaceholderCopy } from '../../../../utils/personUtils'

describe('PipeOpdScreening', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('should set the body', () => {
      const page = new PipeOpdScreening(
        {
          pipeReferral: 'yes',
          pipeReferralMoreDetail: 'More detail',
        },
        application,
      )

      expect(page.body).toEqual({ pipeReferral: 'yes', pipeReferralMoreDetail: 'More detail' })
    })
  })

  itShouldHavePreviousValue(new PipeOpdScreening({}, application), 'pipe-referral')
  itShouldHaveNextValue(new PipeOpdScreening({}, application), '')

  describe('errors', () => {
    it('should return an empty object if the pipeReferral is populated', () => {
      const page = new PipeOpdScreening({ pipeReferral: 'yes' }, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an errors if the pipeReferral is not populated', () => {
      const page = new PipeOpdScreening({}, application)
      expect(page.errors()).toEqual({
        pipeReferral:
          'You must specify if an application for PIPE placement has been recommended in the OPD pathway plan',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response when the user has answered "no" to the `pipeReferral` question', () => {
      const page = new PipeOpdScreening(
        {
          pipeReferral: 'no',
        },
        application,
      )

      expect(page.response()).toEqual({
        [page.title]: 'No',
      })
    })

    it('should return a translated version of the response when the user has answered "yes" to the `pipeReferral` question', () => {
      const page = new PipeOpdScreening(
        {
          pipeReferral: 'yes',
          pipeReferralMoreDetail: 'Some Text',
        },
        application,
      )

      expect(page.response()).toEqual({
        [page.title]: 'Yes',
        [`Provide any additional detail about why ${nameOrPlaceholderCopy(
          application.person,
        )} needs a PIPE placement.`]: 'Some Text',
      })
    })
  })
})

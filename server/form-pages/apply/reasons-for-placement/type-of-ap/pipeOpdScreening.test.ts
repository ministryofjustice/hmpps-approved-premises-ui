import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'

import PipeOpdScreening from './pipeOpdScreening'

describe('PipeOpdScreening', () => {
  describe('body', () => {
    it('should set the body', () => {
      const page = new PipeOpdScreening({
        pipeReferral: 'yes',
        pipeReferralMoreDetail: 'More detail',
      })

      expect(page.body).toEqual({ pipeReferral: 'yes', pipeReferralMoreDetail: 'More detail' })
    })
  })

  itShouldHavePreviousValue(new PipeOpdScreening({}), 'pipe-referral')
  itShouldHaveNextValue(new PipeOpdScreening({}), '')

  describe('errors', () => {
    it('should return an empty object if the pipeReferral is populated', () => {
      const page = new PipeOpdScreening({ pipeReferral: 'yes' })
      expect(page.errors()).toEqual({})
    })

    it('should return an errors if the pipeReferral is not populated', () => {
      const page = new PipeOpdScreening({})
      expect(page.errors()).toEqual({
        pipeReferral:
          'You must specify if an application for PIPE placement has been recommended in the OPD pathway plan',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response when the user has answered "no" to the `pipeReferral` question', () => {
      const page = new PipeOpdScreening({
        pipeReferral: 'no',
      })

      expect(page.response()).toEqual({
        [page.title]: 'No',
      })
    })

    it('should return a translated version of the response when the user has answered "yes" to the `pipeReferral` question', () => {
      const page = new PipeOpdScreening({
        pipeReferral: 'yes',
        pipeReferralMoreDetail: 'Some Text',
      })

      expect(page.response()).toEqual({
        [page.title]: 'Yes',
        [`Provide any additional detail about why the person needs a PIPE placement.`]: 'Some Text',
      })
    })
  })
})

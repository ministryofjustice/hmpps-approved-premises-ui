import { convertKeyValuePairToRadioItems } from '../formUtils'
import {
  applicationProblemOptions,
  newApplicationToBeSubmittedOptions,
  otherOptions,
  withdrawalRadioOptions,
} from './withdrawalReasons'

describe('withdrawlReasons', () => {
  describe('applicationProblemOptions', () => {
    it('should return the correct options', () => {
      expect(applicationProblemOptions).toEqual({
        error_in_application: 'Error in application',
        duplicate_application: 'Duplicate application',
      })
    })
  })

  describe('otherOptions', () => {
    it('should return the correct options', () => {
      expect(otherOptions).toEqual({
        other: 'Other',
      })
    })
  })

  describe('withdrawalRadioOptions', () => {
    it('should return the correct options', () => {
      expect(withdrawalRadioOptions('CONDITIONAL VALUE')).toEqual([
        { divider: 'New application required' },
        ...convertKeyValuePairToRadioItems(newApplicationToBeSubmittedOptions, undefined),
        { divider: 'Problems with submitted application' },
        ...convertKeyValuePairToRadioItems(applicationProblemOptions, undefined),
        { divider: 'Or' },
        { text: 'Other', value: 'other', conditional: { html: 'CONDITIONAL VALUE' } },
      ])
    })
  })
})

import { convertKeyValuePairToRadioItems } from '../formUtils'
import {
  applicationProblemOptions,
  newApplicationToBeSubmittedOptions,
  placementNoLongerNeededOptions,
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

  describe('withdrawalRadioOptions', () => {
    it('should return the correct options', () => {
      expect(withdrawalRadioOptions()).toEqual([
        { divider: 'The placement is no longer needed' },
        ...convertKeyValuePairToRadioItems(placementNoLongerNeededOptions, undefined),
        { divider: 'A new application is needed' },
        ...convertKeyValuePairToRadioItems(newApplicationToBeSubmittedOptions, undefined),
        { divider: "There's a problem with the application" },
        ...convertKeyValuePairToRadioItems(applicationProblemOptions, undefined),
      ])
    })
  })
})

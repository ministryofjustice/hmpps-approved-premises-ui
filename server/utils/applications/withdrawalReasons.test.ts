import { convertKeyValuePairToRadioItems } from '../formUtils'
import {
  applicationProblemOptions,
  newApplicationToBeSubmittedOptions,
  otherOptions,
  placementNoLongerRequiredOptions,
  withdrawalRadioOptions,
} from './withdrawalReasons'

describe('withdrawlReasons', () => {
  describe('placementNoLongerRequiredOptions', () => {
    it('should return the correct options', () => {
      expect(placementNoLongerRequiredOptions).toEqual({
        alternative_identified_placement_no_longer_required: 'Alternative provision identified',
        change_in_circumstances_placement_no_longer_required: 'Change in circumstances',
        change_in_release_date_placement_no_longer_required: 'Release date changed',
        change_in_release_decision_placement_no_longer_required: 'Change in release decision',
      })
    })
  })

  describe('newApplicationToBeSubmittedOptions', () => {
    it('should return the correct options', () => {
      expect(newApplicationToBeSubmittedOptions).toEqual({
        change_in_circumstances_new_application_to_be_submitted: 'Change in circumstances',
      })
    })
  })

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
        { divider: 'Placement no longer required' },
        ...convertKeyValuePairToRadioItems(placementNoLongerRequiredOptions, undefined),
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

import {
  applicationProblemOptions,
  newApplicationToBeSubmittedOptions,
  placementNoLongerNeededOptions,
} from './withdrawalReasons'

describe('withdrawalReasons', () => {
  describe('applicationProblemOptions', () => {
    it('should return the correct options', () => {
      expect(applicationProblemOptions).toEqual({
        duplicate_application: 'The application was a duplicate',
        error_in_application: 'There was an error in the application',
      })
    })
  })
  describe('newApplicationToBeSubmittedOptions', () => {
    it('should return the correct options', () => {
      expect(newApplicationToBeSubmittedOptions).toEqual({
        change_in_circumstances_new_application_to_be_submitted: 'Their circumstances changed',
      })
    })
  })
  describe('placementNoLongerNeededOptions', () => {
    it('should return the correct options', () => {
      expect(placementNoLongerNeededOptions).toEqual({
        death: 'The person died',
        other: 'The placement is not needed for another reason',
        other_accommodation_identified: 'Other accommodation has been identified',
      })
    })
  })
})

import { YesOrNo } from '@approved-premises/ui'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'

import RoomSharing from './roomSharing'

const body = {
  riskToStaff: 'yes' as YesOrNo,
  riskToStaffDetail: 'Risk to staff detail',
  riskToOthers: 'yes' as YesOrNo,
  riskToOthersDetail: 'Risk to others detail',
  sharingConcerns: 'yes' as YesOrNo,
  sharingConcernsDetail: 'Sharing concerns detail',
  traumaConcerns: 'yes' as YesOrNo,
  traumaConcernsDetail: 'Trauma concerns detail',
  sharingBenefits: 'yes' as YesOrNo,
  sharingBenefitsDetail: 'Sharing benefits detail',
}

describe('RoomSharing', () => {
  describe('body', () => {
    it('should set the body', () => {
      const page = new RoomSharing(body)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHaveNextValue(new RoomSharing({}), 'vulnerability')
  itShouldHavePreviousValue(new RoomSharing({}), 'dashboard')

  describe('errors', () => {
    it('shows errors when the yes/no questions are blank', () => {
      const page = new RoomSharing({})

      expect(page.errors()).toEqual({
        riskToOthers: 'You must specify if there is any evidence that the person may pose a risk to other AP residents',
        riskToStaff: 'You must specify if there is any evidence that the person may pose a risk to AP staff',
        sharingBenefits: 'You must specify if there is potential for the person to benefit from a room share',
        sharingConcerns: 'You must specify if there is any concerns about the person sharing a bedroom',
        traumaConcerns:
          'You must specify if there is any evidence of previous trauma or significant event in the persons history which would indicate that room share may not be suitable',
      })
    })

    it('shows errors when a question has a yes response, but the details are left out', () => {
      const page = new RoomSharing({
        riskToStaff: 'yes',
        riskToOthers: 'yes',
        sharingConcerns: 'yes',
        traumaConcerns: 'yes',
        sharingBenefits: 'yes',
      })

      expect(page.errors()).toEqual({
        riskToOthersDetail:
          'You must specify details about any evidence that the person may pose a risk to other AP residents',
        riskToStaffDetail: 'You must specify details about any evidence that the person may pose a risk to AP staff',
        sharingBenefitsDetail: 'You must specify details about potential for the person to benefit from a room share',
        sharingConcernsDetail: 'You must specify details about any concerns about the person sharing a bedroom',
        traumaConcernsDetail:
          'You must specify details about any evidence of previous trauma or significant event in the persons history which would indicate that room share may not be suitable',
      })
    })
  })

  describe('response', () => {
    it('Adds detail to an answer when the answer is yes', () => {
      const page = new RoomSharing(body)

      expect(page.response()).toEqual({
        'Do you have any concerns about the person sharing a bedroom?': 'Yes - Sharing concerns detail',
        'Is there any evidence of previous trauma or significant event in the persons history which would indicate that room share may not be suitable?':
          'Yes - Trauma concerns detail',
        'Is there any evidence that the person may pose a risk to AP staff?': 'Yes - Risk to staff detail',
        'Is there any evidence that the person may pose a risk to other AP residents?': 'Yes - Risk to others detail',
        'Is there potential for the person to benefit from a room share?': 'Yes - Sharing benefits detail',
      })
    })

    it('does not add detail to questions with a no answer', () => {
      body.riskToOthers = 'no'

      const page = new RoomSharing(body)

      expect(page.response()).toEqual({
        'Do you have any concerns about the person sharing a bedroom?': 'Yes - Sharing concerns detail',
        'Is there any evidence of previous trauma or significant event in the persons history which would indicate that room share may not be suitable?':
          'Yes - Trauma concerns detail',
        'Is there any evidence that the person may pose a risk to AP staff?': 'Yes - Risk to staff detail',
        'Is there any evidence that the person may pose a risk to other AP residents?': 'No',
        'Is there potential for the person to benefit from a room share?': 'Yes - Sharing benefits detail',
      })
    })
  })
})

import { applicationFactory } from '../../../../testutils/factories'
import { retrieveQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import { itShouldHaveNextValue } from '../../../shared'
import { furtherAccessNeedsQuestionsNeeded } from './accessNeeds'

import Covid from './covid'

jest.mock('./accessNeeds')
jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')

describe('Covid', () => {
  const application = applicationFactory.build()

  describe('title', () => {
    expect(new Covid({}, application).title).toBe('COVID information')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new Covid(
        {
          boosterEligibility: 'yes',
          boosterEligibilityDetail: 'some detail',
          immunosuppressed: 'yes',
        },
        application,
      )
      expect(page.body).toEqual({
        boosterEligibility: 'yes',
        boosterEligibilityDetail: 'some detail',
        immunosuppressed: 'yes',
      })
    })
  })

  itShouldHaveNextValue(new Covid({}, application), '')

  describe('previous', () => {
    it('returns access-needs-further-questions if furtherAccessNeedsQuestionsNeeded returns true', () => {
      ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue('')
      ;(furtherAccessNeedsQuestionsNeeded as jest.Mock).mockReturnValue(true)

      const page = new Covid(
        {
          boosterEligibility: 'yes',
          boosterEligibilityDetail: 'some detail',
          immunosuppressed: 'yes',
        },
        application,
      )

      expect(page.previous()).toBe('access-needs-further-questions')
    })

    it('returns access-needs if furtherAccessNeedsQuestionsNeeded returns false', () => {
      ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue('')
      ;(furtherAccessNeedsQuestionsNeeded as jest.Mock).mockReturnValue(false)

      const page = new Covid(
        {
          boosterEligibility: 'yes',
          boosterEligibilityDetail: 'some detail',
          immunosuppressed: 'yes',
        },
        application,
      )

      expect(page.previous()).toBe('access-needs')
    })
  })

  describe('errors', () => {
    const page = new Covid({}, application)
    expect(page.errors()).toEqual({
      boosterEligibility: 'You must confirm if the person is eligible for a COVID-19 booster',
      immunosuppressed:
        'You must confirm if the person is immunosuppressed, eligible for nMAB treatment or higher risk',
    })
  })

  describe('response', () => {
    const page = new Covid(
      {
        boosterEligibility: 'yes',
        boosterEligibilityDetail: 'some detail',
        immunosuppressed: 'yes',
      },
      application,
    )

    expect(page.response()).toEqual({
      'Is the person eligible for COVID-19 vaccination boosters?': 'Yes - some detail',
      'Is the person immunosuppressed, eligible for nMAB treatment or higher risk as per the definitions in the COVID-19 guidance?':
        'Yes',
    })
  })
})

import { DateFormats } from '../../../../utils/dateUtils'
import { assessmentFactory } from '../../../../testutils/factories'
import { YesOrNo } from '../../../../@types/ui'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { retrieveQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'

import ApplicationTimeliness from './applicationTimeliness'

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')
jest.mock('../../../../utils/dateUtils')

describe('ApplicationTimeliness', () => {
  const assessment = assessmentFactory.build()
  describe('title', () => {
    expect(
      new ApplicationTimeliness(
        {
          agreeWithShortNoticeReason: 'yes',
          agreeWithShortNoticeReasonComments: 'some reasons',
        },
        assessment,
      ).title,
    ).toBe('Application timeliness')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new ApplicationTimeliness(
        {
          agreeWithShortNoticeReason: 'yes',
          agreeWithShortNoticeReasonComments: 'some reasons',
        },
        assessment,
      )
      expect(page.body).toEqual({
        agreeWithShortNoticeReason: 'yes',
        agreeWithShortNoticeReasonComments: 'some reasons',
      })
    })
  })

  itShouldHaveNextValue(
    new ApplicationTimeliness(
      {
        agreeWithShortNoticeReason: 'yes',
        agreeWithShortNoticeReasonComments: 'some reasons',
      },
      assessment,
    ),
    '',
  )

  itShouldHavePreviousValue(
    new ApplicationTimeliness(
      {
        agreeWithShortNoticeReason: 'yes',
        agreeWithShortNoticeReasonComments: 'some reasons',
      },
      assessment,
    ),
    'suitability-assessment',
  )

  describe('errors', () => {
    it('should have an error if there are no answers', () => {
      const page = new ApplicationTimeliness(
        {
          agreeWithShortNoticeReason: '' as YesOrNo,
          agreeWithShortNoticeReasonComments: '',
        },
        assessment,
      )

      expect(page.errors()).toEqual({
        agreeWithShortNoticeReason: `You must confirm if you agree with the applicant's reason for submission within 4 months of expected arrival`,
      })
    })

    it('should have error if the assessor disagrees but does not give reasons', () => {
      const page = new ApplicationTimeliness(
        {
          agreeWithShortNoticeReason: 'no',
          agreeWithShortNoticeReasonComments: '',
        },
        assessment,
      )

      expect(page.errors()).toEqual({
        agreeWithShortNoticeReasonComments: `You must provide details to support the decision`,
      })
    })
  })

  describe('response', () => {
    it('returns the response', () => {
      const page = new ApplicationTimeliness(
        {
          agreeWithShortNoticeReason: 'no',
          agreeWithShortNoticeReasonComments: 'some reasons',
        },
        assessment,
      )

      expect(page.response()).toEqual({
        "Do you agree with the applicant's reason for submission within 4 months of expected arrival?": 'No',
        "Do you agree with the applicant's reason for submission within 4 months of expected arrival? Additional comments":
          'some reasons',
      })
    })
  })

  describe('retrieveShortNoticeApplicationDetails', () => {
    const applicationDate = '30/06/2023'
    ;(DateFormats.isoDateToUIDate as jest.Mock).mockReturnValue(applicationDate)
    ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue('onBail')

    const page = new ApplicationTimeliness(
      {
        agreeWithShortNoticeReason: 'no',
        agreeWithShortNoticeReasonComments: 'some reasons',
      },
      assessment,
    )

    expect(page.retrieveShortNoticeApplicationDetails()).toEqual({
      applicationDate,
      lateApplicationReason: 'The individual will be on bail',
    })
  })
})

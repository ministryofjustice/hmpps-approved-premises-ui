import { DateFormats } from '../../../../utils/dateUtils'
import { assessmentFactory } from '../../../../testutils/factories'
import { YesOrNo } from '../../../../@types/ui'
import { retrieveOptionalQuestionResponseFromApplicationOrAssessment } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'

import ApplicationTimeliness from './applicationTimeliness'
import { noticeTypeFromApplication } from '../../../../utils/applications/noticeTypeFromApplication'

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')
jest.mock('../../../../utils/applications/noticeTypeFromApplication')
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

  describe('next', () => {
    it('returns an empty string if the application has a notice type other than emergency', () => {
      expect(
        new ApplicationTimeliness(
          {
            agreeWithShortNoticeReason: 'yes',
            agreeWithShortNoticeReasonComments: 'some reasons',
          },
          assessment,
        ).next(),
      ).toEqual('')
    })

    it('returns contingency-plan-suitability if the application ahs a notice type of emergency', () => {
      ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('emergency')
      expect(
        new ApplicationTimeliness(
          {
            agreeWithShortNoticeReason: 'yes',
            agreeWithShortNoticeReasonComments: 'some reasons',
          },
          assessment,
        ).next(),
      ).toEqual('contingency-plan-suitability')
    })
  })

  describe('previous', () => {
    it('returns rfap-suitability if the applicant requires an RFAP', () => {
      ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue('yes')

      expect(
        new ApplicationTimeliness(
          {
            agreeWithShortNoticeReason: 'yes',
            agreeWithShortNoticeReasonComments: 'some reasons',
          },
          assessment,
        ).previous(),
      ).toEqual('rfap-suitability')
    })

    it('returns suitability-assessment if the applicant doesnt require an RFAP', () => {
      ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue(undefined)

      expect(
        new ApplicationTimeliness(
          {
            agreeWithShortNoticeReason: 'yes',
            agreeWithShortNoticeReasonComments: 'some reasons',
          },
          assessment,
        ).previous(),
      ).toEqual('suitability-assessment')
    })
  })

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
    ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue('onBail')

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

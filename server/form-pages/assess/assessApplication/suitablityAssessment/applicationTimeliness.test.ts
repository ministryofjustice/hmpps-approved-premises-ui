import { DateFormats } from '../../../../utils/dateUtils'
import { assessmentFactory } from '../../../../testutils/factories'
import { YesOrNo } from '../../../../@types/ui'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'

import ApplicationTimeliness from './applicationTimeliness'
import { noticeTypeFromApplication } from '../../../../utils/applications/noticeTypeFromApplication'
import { arrivalDateFromApplication } from '../../../../utils/applications/arrivalDateFromApplication'
import { ShortNoticeReasons } from '../../../apply/reasons-for-placement/basic-information/reasonForShortNotice'

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')
jest.mock('../../../../utils/applications/noticeTypeFromApplication')
jest.mock('../../../../utils/applications/arrivalDateFromApplication')

const body = {
  agreeWithShortNoticeReason: 'no',
  agreeWithShortNoticeReasonComments: 'some reasons',
  reasonForLateApplication: 'onBail',
} as const

describe('ApplicationTimeliness', () => {
  const assessment = assessmentFactory.build()
  describe('title', () => {
    expect(new ApplicationTimeliness(body, assessment).title).toBe('Application timeliness')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new ApplicationTimeliness(body, assessment)
      expect(page.body).toEqual(body)
    })
  })

  describe('next', () => {
    it('returns an empty string if the application has a notice type other than emergency', () => {
      expect(new ApplicationTimeliness(body, assessment).next()).toEqual('')
    })

    it('returns contingency-plan-suitability if the application ahs a notice type of emergency', () => {
      ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('emergency')
      expect(new ApplicationTimeliness(body, assessment).next()).toEqual('contingency-plan-suitability')
    })
  })

  describe('previous', () => {
    it('returns rfap-suitability if the applicant requires an RFAP', () => {
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue('yes')

      expect(new ApplicationTimeliness(body, assessment).previous()).toEqual('rfap-suitability')
    })

    it('returns suitability-assessment if the applicant doesnt require an RFAP', () => {
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue(undefined)

      expect(new ApplicationTimeliness(body, assessment).previous()).toEqual('suitability-assessment')
    })
  })

  describe('errors', () => {
    it('should have an error if there are no answers', () => {
      const page = new ApplicationTimeliness(
        {
          agreeWithShortNoticeReason: '' as YesOrNo,
          agreeWithShortNoticeReasonComments: '',
          reasonForLateApplication: 'onBail',
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
          reasonForLateApplication: 'onBail',
        },
        assessment,
      )

      expect(page.errors()).toEqual({
        agreeWithShortNoticeReasonComments: `You must provide details to support the decision`,
      })
    })

    it('should have error if the assessor disagrees but doesnt give a reason for late application', () => {
      const page = new ApplicationTimeliness(
        {
          agreeWithShortNoticeReason: 'no',
          agreeWithShortNoticeReasonComments: 'some comment',
          reasonForLateApplication: '' as ShortNoticeReasons,
        },
        assessment,
      )

      expect(page.errors()).toEqual({
        reasonForLateApplication: 'You must provide a reason for the late application',
      })
    })
  })

  describe('response', () => {
    it('returns the response', () => {
      const page = new ApplicationTimeliness({ ...body }, assessment)

      expect(page.response()).toEqual({
        "Do you agree with the applicant's reason for submission within 4 months of expected arrival?": 'No',
        "Do you agree with the applicant's reason for submission within 4 months of expected arrival? Additional comments":
          'some reasons',
        'What is the reason for the late application?': 'The individual will be on bail',
      })
    })
  })

  describe('retrieveShortNoticeApplicationDetails', () => {
    const applicationDate = '2023-06-01'
    const arrivalDate = '2024-01-04'
    const assessmentForApplicationDetails = assessment
    assessmentForApplicationDetails.application.submittedAt = applicationDate
    ;(
      retrieveOptionalQuestionResponseFromFormArtifact as jest.MockedFn<
        typeof retrieveOptionalQuestionResponseFromFormArtifact
      >
    ).mockReturnValue('onBail')
    ;(arrivalDateFromApplication as jest.MockedFn<typeof arrivalDateFromApplication>).mockReturnValue(arrivalDate)

    const page = new ApplicationTimeliness(body, assessment)

    expect(page.retrieveShortNoticeApplicationDetails()).toEqual({
      applicationDate: DateFormats.isoDateToUIDate(applicationDate, { format: 'short' }),
      lateApplicationReason: 'The individual will be on bail',
      arrivalDate: DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }),
    })
  })
})

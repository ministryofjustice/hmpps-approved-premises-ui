import { DateFormats } from '../../../../utils/dateUtils'
import { assessmentFactory } from '../../../../testutils/factories'
import { YesOrNo } from '../../../../@types/ui'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'

import ApplicationTimeliness from './applicationTimeliness'
import { arrivalDateFromApplication } from '../../../../utils/applications/arrivalDateFromApplication'
import { ShortNoticeReasons } from '../../../apply/reasons-for-placement/basic-information/reasonForShortNotice'
import { suitabilityAssessmentAdjacentPage } from '../../../../utils/assessments/suitabilityAssessmentAdjacentPage'

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')
jest.mock('../../../../utils/assessments/suitabilityAssessmentAdjacentPage')
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
    it('returns the result of suitabilityAssessmentAdjacentPage', () => {
      ;(suitabilityAssessmentAdjacentPage as jest.Mock).mockReturnValue('application-timeliness')
      expect(new ApplicationTimeliness(body, assessment).next()).toEqual('application-timeliness')
    })
  })

  describe('previous', () => {
    it('returns the result of suitabilityAssessmentAdjacentPage', () => {
      ;(suitabilityAssessmentAdjacentPage as jest.MockedFn<typeof suitabilityAssessmentAdjacentPage>).mockReturnValue(
        'suitability-assessment',
      )
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
        agreeWithShortNoticeReason: `You must confirm if you agree with the applicant's reason for submission outside of National Standards timescales`,
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
        "Do you agree with the applicant's reason for submission outside of National Standards timescales?": 'No',
        "Do you agree with the applicant's reason for submission outside of National Standards timescales? Additional comments":
          'some reasons',
        'What is the reason for the late application?': 'The individual will be on bail',
      })
    })

    it('can handle an undefined reason for late application (for legacy compatibility reasons)', () => {
      const page = new ApplicationTimeliness({ ...body, reasonForLateApplication: undefined }, assessment)

      expect(page.response()).toEqual({
        "Do you agree with the applicant's reason for submission outside of National Standards timescales?": 'No',
        "Do you agree with the applicant's reason for submission outside of National Standards timescales? Additional comments":
          'some reasons',
        'What is the reason for the late application?': 'No reason supplied',
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

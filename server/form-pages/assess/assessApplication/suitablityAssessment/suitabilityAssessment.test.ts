import { assessmentFactory } from '../../../../testutils/factories'
import { YesOrNo } from '../../../../@types/ui'
import { itShouldHavePreviousValue } from '../../../shared-examples'

import SuitabilityAssessment from './suitabilityAssessment'
import { suitabilityAssessmentAdjacentPage } from '../../../../utils/assessments/suitabilityAssessmentAdjacentPage'

jest.mock('../../../../utils/applications/shouldShowContingencyPlanPages')
jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')
jest.mock('../../../../utils/assessments/suitabilityAssessmentAdjacentPage.ts')

describe('SuitabilityAssessment', () => {
  const assessment = assessmentFactory.build()

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('title', () => {
    expect(
      new SuitabilityAssessment(
        {
          riskFactors: 'yes',
          riskManagement: 'yes',
          locationOfPlacement: 'yes',
          moveOnPlan: 'yes',
        },
        assessment,
      ).title,
    ).toBe('Suitability assessment')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new SuitabilityAssessment(
        {
          riskFactors: 'yes',
          riskManagement: 'yes',
          locationOfPlacement: 'yes',
          moveOnPlan: 'yes',
        },
        assessment,
      )
      expect(page.body).toEqual({
        locationOfPlacement: 'yes',
        moveOnPlan: 'yes',
        riskFactors: 'yes',
        riskManagement: 'yes',
      })
    })
  })

  describe('next', () => {
    it('returns rfap-suitability if the application needs an RFAP', () => {
      ;(suitabilityAssessmentAdjacentPage as jest.MockedFn<typeof suitabilityAssessmentAdjacentPage>).mockReturnValue(
        'rfap-suitability',
      )
      expect(
        new SuitabilityAssessment(
          {
            riskFactors: 'yes',
            riskManagement: 'yes',
            locationOfPlacement: 'yes',
            moveOnPlan: 'yes',
          },
          assessment,
        ).next(),
      ).toEqual('rfap-suitability')
    })

    it('returns pipe-suitability if the application needs a PIPE', () => {
      ;(suitabilityAssessmentAdjacentPage as jest.MockedFn<typeof suitabilityAssessmentAdjacentPage>).mockReturnValue(
        'pipe-suitability',
      )
      expect(
        new SuitabilityAssessment(
          {
            riskFactors: 'yes',
            riskManagement: 'yes',
            locationOfPlacement: 'yes',
            moveOnPlan: 'yes',
          },
          assessment,
        ).next(),
      ).toEqual('pipe-suitability')
    })

    it('returns esap-suitability if the application needs a ESAP', () => {
      ;(suitabilityAssessmentAdjacentPage as jest.MockedFn<typeof suitabilityAssessmentAdjacentPage>).mockReturnValue(
        'esap-suitability',
      )
      expect(
        new SuitabilityAssessment(
          {
            riskFactors: 'yes',
            riskManagement: 'yes',
            locationOfPlacement: 'yes',
            moveOnPlan: 'yes',
          },
          assessment,
        ).next(),
      ).toEqual('esap-suitability')
    })

    it('returns application-timeliness if the notice type is shortNotice', () => {
      ;(suitabilityAssessmentAdjacentPage as jest.MockedFn<typeof suitabilityAssessmentAdjacentPage>).mockReturnValue(
        'application-timeliness',
      )
      expect(
        new SuitabilityAssessment(
          {
            riskFactors: 'yes',
            riskManagement: 'yes',
            locationOfPlacement: 'yes',
            moveOnPlan: 'yes',
          },
          assessment,
        ).next(),
      ).toEqual('application-timeliness')
    })

    it('returns application-timeliness if the notice type is emergency', () => {
      ;(suitabilityAssessmentAdjacentPage as jest.MockedFn<typeof suitabilityAssessmentAdjacentPage>).mockReturnValue(
        'application-timeliness',
      )
      expect(
        new SuitabilityAssessment(
          {
            riskFactors: 'yes',
            riskManagement: 'yes',
            locationOfPlacement: 'yes',
            moveOnPlan: 'yes',
          },
          assessment,
        ).next(),
      ).toEqual('application-timeliness')
    })

    it('returns contingency-plan-suitability if the application has a contingency plan', () => {
      ;(suitabilityAssessmentAdjacentPage as jest.MockedFn<typeof suitabilityAssessmentAdjacentPage>).mockReturnValue(
        'contingency-plan-suitability',
      )
      expect(
        new SuitabilityAssessment(
          {
            riskFactors: 'yes',
            riskManagement: 'yes',
            locationOfPlacement: 'yes',
            moveOnPlan: 'yes',
          },
          assessment,
        ).next(),
      ).toEqual('contingency-plan-suitability')
    })

    it('returns an empty string if the notice type is standard', () => {
      ;(suitabilityAssessmentAdjacentPage as jest.MockedFn<typeof suitabilityAssessmentAdjacentPage>).mockReturnValue(
        '',
      )
      expect(
        new SuitabilityAssessment(
          {
            riskFactors: 'yes',
            riskManagement: 'yes',
            locationOfPlacement: 'yes',
            moveOnPlan: 'yes',
          },
          assessment,
        ).next(),
      ).toEqual('')
    })
  })

  itShouldHavePreviousValue(
    new SuitabilityAssessment(
      {
        riskFactors: 'yes',
        riskManagement: 'yes',
        locationOfPlacement: 'yes',
        moveOnPlan: 'yes',
      },
      assessment,
    ),
    'dashboard',
  )

  describe('errors', () => {
    it('should have an error if there are no answers', () => {
      const page = new SuitabilityAssessment(
        {
          riskFactors: '' as YesOrNo,
          riskManagement: '' as YesOrNo,
          locationOfPlacement: '' as YesOrNo,
          moveOnPlan: '' as YesOrNo,
        },
        assessment,
      )

      expect(page.errors()).toEqual({
        locationOfPlacement: 'You must confirm if there are factors to consider regarding the location of placement',
        moveOnPlan: 'You must confirm if the move on plan is sufficient',
        riskFactors: 'You must confirm if the application identifies the risk factors that an AP placement can support',
        riskManagement:
          'You must confirm if the application explains how an AP placement would be beneficial for risk management',
      })
    })

    it('should show errors if the answers are no and no comments are provided', () => {
      const page = new SuitabilityAssessment(
        {
          riskFactors: 'no',
          riskManagement: 'no',
          locationOfPlacement: 'no',
          moveOnPlan: 'no',
        },
        assessment,
      )

      expect(page.errors()).toEqual({
        moveOnPlanComments: 'You must explain why the move on plan is insufficient',
        riskFactorsComments:
          'You must explain how the application fails to identify the risk factors that an AP placement can support',
        locationOfPlacementComments: 'You must comment on how location factors have not been considered',
        riskManagementComments:
          'You must explain how the application fails to identify how an AP placement would be beneficial for risk management',
      })
    })
  })

  describe('response', () => {
    it('returns the response', () => {
      const page = new SuitabilityAssessment(
        {
          riskFactors: 'yes',
          riskFactorsComments: 'Some comments about risk factors',
          riskManagement: 'no',
          riskManagementComments: 'Risk management comments',
          locationOfPlacement: 'no',
          locationOfPlacementComments: 'Some comments about location of placement',
          moveOnPlan: 'yes',
          moveOnPlanComments: 'Move on plan comments',
        },
        assessment,
      )

      expect(page.response()).toEqual({
        'Are there factors to consider regarding the location of placement?': 'No',
        'Are there factors to consider regarding the location of placement? Additional comments':
          'Some comments about location of placement',
        'Does the application explain how an AP placement would be beneficial for risk management?': 'No',
        'Does the application explain how an AP placement would be beneficial for risk management? Additional comments':
          'Risk management comments',
        'Does the application identify the risk factors that an Approved Premises (AP) placement can support?': 'Yes',
        'Does the application identify the risk factors that an Approved Premises (AP) placement can support? Additional comments':
          'Some comments about risk factors',
        'Is the move on plan sufficient?': 'Yes',
        'Is the move on plan sufficient? Additional comments': 'Move on plan comments',
      })
    })
  })
})

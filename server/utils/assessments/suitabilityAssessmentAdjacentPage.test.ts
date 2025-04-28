import { when } from 'jest-when'
import { ApType, ApprovedPremisesAssessment } from '@approved-premises/api'
import { assessmentFactory } from '../../testutils/factories'
import {
  shouldShowContingencyPlanPartnersPages,
  shouldShowContingencyPlanQuestionsPage,
} from '../applications/shouldShowContingencyPlanPages'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import { SuitabilityAssessmentPageName, suitabilityAssessmentAdjacentPage } from './suitabilityAssessmentAdjacentPage'
import { startDateOutsideOfNationalStandardsTimescales } from '../applications/startDateOutsideOfNationalStandardsTimescales'
import SelectApType from '../../form-pages/apply/reasons-for-placement/type-of-ap/apType'

jest.mock('../retrieveQuestionResponseFromFormArtifact')
jest.mock('../applications/shouldShowContingencyPlanPages')
jest.mock('../applications/startDateOutsideOfNationalStandardsTimescales')

const specialistApTypes: Array<Exclude<ApType, 'normal'>> = [
  'rfap',
  'esap',
  'pipe',
  'mhapStJosephs',
  'mhapElliottHouse',
]

type SpecialistApType = (typeof specialistApTypes)[number]

const mockApplicationOfType = (apType: ApType, assessment: ApprovedPremisesAssessment) => {
  when(retrieveOptionalQuestionResponseFromFormArtifact)
    .calledWith(assessment.application, SelectApType, 'type')
    .mockReturnValue(apType)
}

const apTypeToPageName = (apType: SpecialistApType): SuitabilityAssessmentPageName => {
  switch (apType) {
    case 'mhapElliottHouse':
      return 'mhap-suitability'
    case 'mhapStJosephs':
      return 'mhap-suitability'
    default:
      return `${apType}-suitability`
  }
}

describe('suitabilityAssessmentAdjacentPage', () => {
  const assessment = assessmentFactory.build()

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('With the suitability-assessment page', () => {
    describe.each(specialistApTypes)('with an %s application', apType => {
      beforeEach(() => {
        mockApplicationOfType(apType, assessment)
      })

      it('should return the correct next page', () => {
        expect(suitabilityAssessmentAdjacentPage(assessment, 'suitability-assessment')).toEqual(
          apTypeToPageName(apType),
        )
      })
    })
  })

  describe.each(specialistApTypes)('with an %s application', apType => {
    const pageName = apTypeToPageName(apType)

    describe('when the start date is outside of national timescales', () => {
      beforeEach(() => {
        mockApplicationOfType(apType, assessment)
        when(startDateOutsideOfNationalStandardsTimescales).calledWith(assessment.application).mockReturnValue(true)
      })

      it('should return the application-timeliness page as the next page', () => {
        expect(suitabilityAssessmentAdjacentPage(assessment, pageName)).toEqual('application-timeliness')
      })

      it('should return suitability-assessment as the previous page', () => {
        expect(
          suitabilityAssessmentAdjacentPage(assessment, pageName, {
            returnPreviousPage: true,
          }),
        ).toEqual('suitability-assessment')
      })
    })

    describe('when the start date is not outside of national timescales and the contingency plan partners page should be shown', () => {
      beforeEach(() => {
        when(startDateOutsideOfNationalStandardsTimescales).calledWith(assessment.application).mockReturnValue(false)
        when(shouldShowContingencyPlanPartnersPages).calledWith(assessment.application).mockReturnValue(true)
      })

      it('should return the contingency-plan-suitability page when the start date is not outside of national timescales and the contingency plan partners page should be shown', () => {
        expect(suitabilityAssessmentAdjacentPage(assessment, pageName)).toEqual('contingency-plan-suitability')
      })

      it('should return suitability-assessment as the previous page', () => {
        expect(
          suitabilityAssessmentAdjacentPage(assessment, pageName, {
            returnPreviousPage: true,
          }),
        ).toEqual('suitability-assessment')
      })
    })

    describe('when the start date is not outside of national timescales and the contingency plan questions page should be shown', () => {
      beforeEach(() => {
        when(startDateOutsideOfNationalStandardsTimescales).calledWith(assessment.application).mockReturnValue(false)
        when(shouldShowContingencyPlanPartnersPages).calledWith(assessment.application).mockReturnValue(false)
        when(shouldShowContingencyPlanQuestionsPage).calledWith(assessment.application).mockReturnValue(true)
      })

      it('should return the contingency-plan-suitability page', () => {
        expect(suitabilityAssessmentAdjacentPage(assessment, pageName)).toEqual('contingency-plan-suitability')
      })

      it('should return suitability-assessment as the previous page', () => {
        expect(
          suitabilityAssessmentAdjacentPage(assessment, pageName, {
            returnPreviousPage: true,
          }),
        ).toEqual('suitability-assessment')
      })
    })
  })

  describe('with the application-timeliness page', () => {
    beforeEach(() => {
      when(startDateOutsideOfNationalStandardsTimescales).calledWith(assessment.application).mockReturnValue(true)
    })

    describe('if the contingency plan partners pages should be shown', () => {
      beforeEach(() => {
        when(shouldShowContingencyPlanPartnersPages).calledWith(assessment.application).mockReturnValue(true)
      })

      it('should show the contingency-plan-suitability page', () => {
        expect(suitabilityAssessmentAdjacentPage(assessment, 'application-timeliness')).toEqual(
          'contingency-plan-suitability',
        )
      })

      describe.each(specialistApTypes)('should return the correct previous page for a %s application', apType => {
        it('should return the correct previous page', () => {
          mockApplicationOfType(apType, assessment)

          expect(
            suitabilityAssessmentAdjacentPage(assessment, 'application-timeliness', {
              returnPreviousPage: true,
            }),
          ).toEqual(apTypeToPageName(apType))
        })
      })
    })

    describe('if the contingency plan questions page should be shown', () => {
      beforeEach(() => {
        when(shouldShowContingencyPlanPartnersPages).calledWith(assessment.application).mockReturnValue(false)
        when(shouldShowContingencyPlanQuestionsPage).calledWith(assessment.application).mockReturnValue(true)
      })

      it('should show the contingency-plan-suitability page', () => {
        expect(suitabilityAssessmentAdjacentPage(assessment, 'application-timeliness')).toEqual(
          'contingency-plan-suitability',
        )
      })

      describe.each(specialistApTypes)('should return the correct previous page for a %s application', apType => {
        it('should return the correct previous page', () => {
          mockApplicationOfType(apType, assessment)

          expect(
            suitabilityAssessmentAdjacentPage(assessment, 'application-timeliness', {
              returnPreviousPage: true,
            }),
          ).toEqual(apTypeToPageName(apType))
        })
      })
    })
  })

  describe('with the contingency-plan-suitability page', () => {
    beforeEach(() => {
      when(shouldShowContingencyPlanPartnersPages).calledWith(assessment.application).mockReturnValue(true)
    })

    it('should return an empty string', () => {
      expect(suitabilityAssessmentAdjacentPage(assessment, 'contingency-plan-suitability')).toEqual('')
    })

    describe('when the start date is outside the national standards timescales', () => {
      beforeEach(() => {
        when(startDateOutsideOfNationalStandardsTimescales).calledWith(assessment.application).mockReturnValue(true)
      })

      it('should return application-timeliness as the previous page', () => {
        expect(
          suitabilityAssessmentAdjacentPage(assessment, 'contingency-plan-suitability', { returnPreviousPage: true }),
        ).toEqual('application-timeliness')
      })
    })

    describe('when the start date is not outside the national standards timescales', () => {
      beforeEach(() => {
        when(startDateOutsideOfNationalStandardsTimescales).calledWith(assessment.application).mockReturnValue(false)
      })

      describe.each(specialistApTypes)('should return the correct previous page for a %s application', apType => {
        it('should return the correct previous page', () => {
          mockApplicationOfType(apType, assessment)

          expect(
            suitabilityAssessmentAdjacentPage(assessment, 'contingency-plan-suitability', {
              returnPreviousPage: true,
            }),
          ).toEqual(apTypeToPageName(apType))
        })
      })
    })
  })
})

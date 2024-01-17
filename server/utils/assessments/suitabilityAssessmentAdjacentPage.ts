import { ApprovedPremisesAssessment as Assessment } from '../../@types/shared'
import SelectApType from '../../form-pages/apply/reasons-for-placement/type-of-ap/apType'
import Rfap from '../../form-pages/apply/risk-and-need-factors/further-considerations/rfap'
import { noticeTypeFromApplication } from '../applications/noticeTypeFromApplication'
import { shouldShowContingencyPlanPartnersPages } from '../applications/shouldShowContingencyPlanPages'
import { retrieveOptionalQuestionResponseFromFormArtifact as responseFromAssessment } from '../retrieveQuestionResponseFromFormArtifact'

const suitabilityAssessmentPageNames = [
  'suitability-assessment',
  'rfap-suitability',
  'esap-suitability',
  'pipe-suitability',
  'application-timeliness',
  'contingency-plan-suitability',
] as const

type SuitabilityAssessmentPageName = (typeof suitabilityAssessmentPageNames)[number]

export const suitabilityAssessmentAdjacentPage = (
  assessment: Assessment,
  currentPage: SuitabilityAssessmentPageName,
  { returnPreviousPage } = { returnPreviousPage: false },
) => {
  const suitabilityAssessmentPages: Array<{
    pageName: SuitabilityAssessmentPageName
    needsAssessment: boolean
  }> = [
    {
      pageName: 'rfap-suitability',
      needsAssessment: responseFromAssessment(assessment.application, Rfap, 'needARfap') === 'yes',
    },
    {
      pageName: 'esap-suitability',
      needsAssessment: responseFromAssessment(assessment.application, SelectApType, 'type') === 'esap',
    },
    {
      pageName: 'pipe-suitability',
      needsAssessment: responseFromAssessment(assessment.application, SelectApType, 'type') === 'pipe',
    },
    {
      pageName: 'application-timeliness',
      needsAssessment:
        noticeTypeFromApplication(assessment.application) === 'short_notice' ||
        noticeTypeFromApplication(assessment.application) === 'emergency',
    },
    {
      pageName: 'contingency-plan-suitability',
      needsAssessment: shouldShowContingencyPlanPartnersPages(assessment.application),
    },
  ]

  if (returnPreviousPage) {
    const pagesNeedingAssessment = suitabilityAssessmentPages.filter(page => page.needsAssessment)
    const previousPageIndex = pagesNeedingAssessment.findIndex(page => currentPage === page.pageName) - 1

    return pagesNeedingAssessment[previousPageIndex]?.pageName || 'suitability-assessment'
  }

  suitabilityAssessmentPages.splice(0, suitabilityAssessmentPages.findIndex(page => currentPage === page.pageName) + 1)

  const nextPage = suitabilityAssessmentPages.find(page => {
    return page.needsAssessment
  })

  return nextPage?.pageName || ''
}

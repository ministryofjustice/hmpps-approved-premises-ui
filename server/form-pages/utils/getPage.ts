import { type FormArtifact, type FormPages, type FormSections, JourneyType, TaskNames } from '../../@types/ui'
import { TasklistPageInterface } from '../tasklistPage'
import { UnknownPageError } from '../../utils/errors'
// import { journeyPages } from '../../utils/applications/utils'
import Apply from '../apply'
import Assess from '../assess'
import PlacementRequest from '../placement-application'
import PreArrivals from '../residence/pre-arrival'
import { journeyTypeFromArtifact } from '../../utils/journeyTypeFromArtifact'
import isAssessment from '../../utils/assessments/isAssessment'
import getAssessmentSections from '../../utils/assessments/getSections'

export const getSections = (formArtifact: FormArtifact): FormSections => {
  const journeyType = journeyTypeFromArtifact(formArtifact)

  switch (journeyType) {
    case 'applications':
      return Apply.sections.slice(0, -1)
    case 'assessments':
      if (!isAssessment(formArtifact)) throw new Error('Form artifact is not an assessment')
      return getAssessmentSections(formArtifact)
    case 'placement-applications':
      return PlacementRequest.sections
    case 'pre-arrival':
      return PreArrivals.sections
    default:
      throw new Error(`Unknown journey type: ${journeyType}`)
  }
}

export const journeyPages = (journeyType: JourneyType): FormPages => {
  switch (journeyType) {
    case 'applications':
      return Apply.pages
    case 'assessments':
      return Assess.pages
    case 'placement-applications':
      return PlacementRequest.pages
    case 'pre-arrival':
      return PreArrivals.pages
    case 'profile':
      return PreArrivals.pages
    default:
      throw new Error(`Unknown journey type: ${journeyType}`)
  }
}

export const getPage = (taskName: TaskNames, pageName: string, journeyType: JourneyType): TasklistPageInterface => {
  const pageList = journeyPages(journeyType)[taskName]
  const Page = pageList[pageName]

  if (!Page) {
    throw new UnknownPageError(pageName)
  }

  return Page as TasklistPageInterface
}

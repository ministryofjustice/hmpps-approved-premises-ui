import { FormArtifact, JourneyType } from '../@types/ui'
import isAssessment from './assessments/isAssessment'
import { isPlacementApplication } from './placementRequests/isPlacementApplication'

export const journeyTypeFromArtifact = (artifact: FormArtifact): JourneyType => {
  if (isAssessment(artifact)) return 'assessments'
  if (isPlacementApplication(artifact)) return 'placement-applications'
  return 'applications'
}

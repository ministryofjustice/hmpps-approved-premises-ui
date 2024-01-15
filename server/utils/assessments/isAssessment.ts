import { ApprovedPremisesAssessment as Assessment } from '../../@types/shared'
import { FormArtifact } from '../../@types/ui'

export default (formArtifact: FormArtifact): formArtifact is Assessment =>
  (formArtifact as Assessment)?.application !== undefined

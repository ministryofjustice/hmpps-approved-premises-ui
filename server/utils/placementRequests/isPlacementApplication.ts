import { PlacementApplication } from '../../@types/shared'
import { FormArtifact } from '../../@types/ui'

export const isPlacementApplication = (formArtifact: FormArtifact): formArtifact is PlacementApplication => {
  return (formArtifact as PlacementApplication)?.applicationId !== undefined
}

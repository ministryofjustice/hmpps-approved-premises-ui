import { FormArtifact, PageResponse } from '../../@types/ui'
import { FeatureFlags } from '../../services/featureFlagService'
import { journeyTypeFromArtifact } from '../journeyTypeFromArtifact'
import { getPage } from './getPage'

export const getResponseForPage = (
  formArtifact: FormArtifact,
  taskName: string,
  pageName: string,
  featureFlags: FeatureFlags,
): PageResponse => {
  const Page = getPage(taskName, pageName, journeyTypeFromArtifact(formArtifact))

  const body = formArtifact?.data?.[taskName]?.[pageName]
  const page = new Page(body, formArtifact, featureFlags)

  return page.response()
}

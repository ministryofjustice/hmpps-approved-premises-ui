import { applicationFactory, assessmentFactory, placementApplicationFactory } from '../testutils/factories'
import { journeyTypeFromArtifact } from './journeyTypeFromArtifact'

describe('journeyTypeFromArtifact', () => {
  it('returns "placementRequest" if the artifact is a placement request', () => {
    const placementApplication = placementApplicationFactory.build()

    expect(journeyTypeFromArtifact(placementApplication)).toEqual('placement-applications')
  })

  it('returns "application" if the artifact is an application', () => {
    const application = applicationFactory.build()

    expect(journeyTypeFromArtifact(application)).toEqual('applications')
  })

  it('returns "assessment" if the artifact is an assessment', () => {
    const assessment = assessmentFactory.build()

    expect(journeyTypeFromArtifact(assessment)).toEqual('assessments')
  })
})

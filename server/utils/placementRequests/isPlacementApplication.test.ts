import { applicationFactory, assessmentFactory, placementApplicationFactory } from '../../testutils/factories'
import { isPlacementApplication } from './isPlacementApplication'

describe('isPlacementApplication', () => {
  it('returns true if the document is an placementRequest', () => {
    const placementApplication = placementApplicationFactory.build()
    expect(isPlacementApplication(placementApplication)).toBe(true)
  })

  it('returns false if the document is an application', () => {
    const application = applicationFactory.build()
    expect(isPlacementApplication(application)).toBe(false)
  })

  it('returns false if the document is an assessment', () => {
    const assessment = assessmentFactory.build()
    expect(isPlacementApplication(assessment)).toBe(false)
  })
})

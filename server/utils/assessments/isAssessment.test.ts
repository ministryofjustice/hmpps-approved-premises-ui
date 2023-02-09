import isAssessment from './isAssessment'
import assessmentFactory from '../../testutils/factories/assessment'
import applicationFactory from '../../testutils/factories/application'

describe('isAssessment', () => {
  it('returns true if the document is an assessment', () => {
    const assessment = assessmentFactory.build()
    expect(isAssessment(assessment)).toBe(true)
  })

  it('returns false if the document is an application', () => {
    const application = applicationFactory.build()
    expect(isAssessment(application)).toBe(false)
  })
})

import Assess from '../../form-pages/assess'
import { assessmentFactory } from '../../testutils/factories'
import getSections from './getSections'
import * as descisionUtils from './decisionUtils'

describe('getSections', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  const assessment = assessmentFactory.build({ status: 'awaiting_response' })

  it('returns all sections if the application has no decision', () => {
    const sections = getSections(assessment)
    const sectionNames = sections.map(s => s.name)

    expect(sections.length).toEqual(Assess.sections.length)
    expect(sectionNames).toContain('AssessApplication')
  })

  it('removes the matching information section if the application has been rejected', () => {
    jest.spyOn(descisionUtils, 'decisionFromAssessment').mockReturnValue('decision')
    jest.spyOn(descisionUtils, 'applicationAccepted').mockReturnValue(false)

    const sections = getSections(assessment)
    const sectionNames = sections.map(s => s.name)

    expect(sections.length).toEqual(Assess.sections.length - 1)
    expect(sectionNames).not.toContain('MatchingInformation')
  })

  it('retains the matching information section if the application has been accepted', () => {
    jest.spyOn(descisionUtils, 'decisionFromAssessment').mockReturnValue('decision')
    jest.spyOn(descisionUtils, 'applicationAccepted').mockReturnValue(true)

    const sections = getSections(assessment)
    const sectionNames = sections.map(s => s.name)

    expect(sections.length).toEqual(Assess.sections.length)
    expect(sectionNames).toContain('MatchingInformation')
  })

  it('removes the assess application section if there is not enough information after request completed', () => {
    jest.spyOn(descisionUtils, 'notEnoughInformationFromAssessment').mockReturnValue(true)
    const sections = getSections(assessment)
    expect(sections.map(s => s.name)).not.toContain('AssessApplication')
  })

  it('retains the assess application section if there is enough information', () => {
    jest.spyOn(descisionUtils, 'notEnoughInformationFromAssessment').mockReturnValue(false)
    const sections = getSections(assessment)
    expect(sections.map(s => s.name)).toContain('AssessApplication')
  })
})

import Assess from '../../form-pages/assess'
import { assessmentFactory } from '../../testutils/factories'
import getSections from './getSections'
import { applicationAccepted, decisionFromAssessment } from './decisionUtils'

jest.mock('./decisionUtils')

describe('getSections', () => {
  const assessment = assessmentFactory.build({ status: 'awaiting_response' })

  it('returns all sections if the application has no decision', () => {
    const sections = getSections(assessment)
    const sectionNames = sections.map(s => s.name)

    expect(sections.length).toEqual(Assess.sections.length)
    expect(sectionNames).toContain('AssessApplication')
  })

  it('removes the matching information section if the application has been rejected', () => {
    ;(decisionFromAssessment as jest.Mock).mockReturnValue('decision')
    ;(applicationAccepted as jest.Mock).mockReturnValue(false)

    const sections = getSections(assessment)
    const sectionNames = sections.map(s => s.name)

    expect(sections.length).toEqual(Assess.sections.length - 1)
    expect(sectionNames).not.toContain('MatchingInformation')
  })

  it('retains the matching information section if the application has been accepted', () => {
    ;(decisionFromAssessment as jest.Mock).mockReturnValue('decision')
    ;(applicationAccepted as jest.Mock).mockReturnValue(true)

    const sections = getSections(assessment)
    const sectionNames = sections.map(s => s.name)

    expect(sections.length).toEqual(Assess.sections.length)
    expect(sectionNames).toContain('MatchingInformation')
  })
})

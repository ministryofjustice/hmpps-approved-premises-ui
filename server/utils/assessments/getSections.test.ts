import Assess from '../../form-pages/assess'
import { assessmentFactory } from '../../testutils/factories'
import getSections from './getSections'
import informationSetAsNotReceived from './informationSetAsNotReceived'
import { applicationAccepted, decisionFromAssessment } from './decisionUtils'

jest.mock('./informationSetAsNotReceived')
jest.mock('./decisionUtils')

describe('getSections', () => {
  const assessment = assessmentFactory.build({ status: 'awaiting_response' })

  it('returns all sections if informationSetAsNotReceived is false', () => {
    ;(informationSetAsNotReceived as jest.Mock).mockReturnValue(false)

    const sections = getSections(assessment)
    const sectionNames = sections.map(s => s.name)

    expect(sections.length).toEqual(Assess.sections.length)
    expect(sectionNames).toContain('AssessApplication')
  })

  it('removes the matching information section if the application has not been accepted', () => {
    ;(informationSetAsNotReceived as jest.Mock).mockReturnValue(false)
    ;(decisionFromAssessment as jest.Mock).mockReturnValue('decision')
    ;(applicationAccepted as jest.Mock).mockReturnValue(false)

    const sections = getSections(assessment)
    const sectionNames = sections.map(s => s.name)

    expect(sections.length).toEqual(Assess.sections.length - 1)
    expect(sectionNames).not.toContain('MatchingInformation')
  })

  it('removes the matching information section if the application has not been accepted', () => {
    ;(informationSetAsNotReceived as jest.Mock).mockReturnValue(false)
    ;(decisionFromAssessment as jest.Mock).mockReturnValue('decision')
    ;(applicationAccepted as jest.Mock).mockReturnValue(true)

    const sections = getSections(assessment)
    const sectionNames = sections.map(s => s.name)

    expect(sections.length).toEqual(Assess.sections.length)
    expect(sectionNames).toContain('MatchingInformation')
  })

  it('removes the matching information section if informationSetAsNotReceived is true and the application has not been accepted', () => {
    ;(informationSetAsNotReceived as jest.Mock).mockReturnValue(true)
    ;(decisionFromAssessment as jest.Mock).mockReturnValue('decision')
    ;(applicationAccepted as jest.Mock).mockReturnValue(false)

    const sections = getSections(assessment)
    const sectionNames = sections.map(s => s.name)

    expect(sections.length).toEqual(Assess.sections.length - 1)
    expect(sectionNames).not.toContain('MatchingInformation')
  })
})

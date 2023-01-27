import Assess from '../../form-pages/assess'
import assessmentFactory from '../../testutils/factories/assessment'
import getSections from './getSections'

describe('getSections', () => {
  const assessment = assessmentFactory.build({ status: 'pending' })

  it('returns all sections if informationReceived is yes', () => {
    assessment.data = { 'sufficient-information': { 'information-received': { informationReceived: 'yes' } } }

    const sections = getSections(assessment)
    const sectionNames = sections.map(s => s.name)

    expect(sections.length).toEqual(Assess.sections.length)
    expect(sectionNames).toContain('AssessApplication')
  })

  it('returns all sections if informationReceived is not yet answered', () => {
    assessment.data = {}

    const sections = getSections(assessment)
    const sectionNames = sections.map(s => s.name)

    expect(sections.length).toEqual(Assess.sections.length)
    expect(sectionNames).toContain('AssessApplication')
  })

  it('removes the assess section if informationReceived is no', () => {
    assessment.data = { 'sufficient-information': { 'information-received': { informationReceived: 'no' } } }

    const sections = getSections(assessment)
    const sectionNames = sections.map(s => s.name)

    expect(sections.length).toEqual(Assess.sections.length - 1)
    expect(sectionNames).not.toContain('AssessApplication')
  })
})

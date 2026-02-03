import { assessmentFactory, cas1OasysGroupFactory } from '../../testutils/factories'
import { oasysInformationFromAssessment, oasysQuestions, oasysTableTabs } from './oasysUtils'

describe('oasysUtils', () => {
  describe('oasysInformationFromAssessment', () => {
    it('returns the oasys information from the assessment', () => {
      const oasysInformation = cas1OasysGroupFactory.build()
      const assessment = assessmentFactory.build()
      assessment.application.data['oasys-import'] = oasysInformation

      expect(oasysInformationFromAssessment(assessment)).toEqual(oasysInformation)
    })

    it('returns an empty string if the case notes are empty', () => {
      const assessment = assessmentFactory.build()
      assessment.application.data['oasys-information'] = {}

      expect(oasysInformationFromAssessment(assessment)).toEqual({})
    })
  })

  describe('OasysQuestions', () => {
    it('maps the section', () => {
      const sections = cas1OasysGroupFactory.roshSummary().build().answers // .slice(0,1)

      expect(oasysQuestions(sections.slice(0, 2))).toBe(
        `<h2 class="govuk-heading-m">${sections[0].questionNumber}. ${sections[0].label}</h2><p class="govuk-body govuk-body__text-block">${sections[0].answer}</p><hr class="govuk-!-margin-bottom-2"/><h2 class="govuk-heading-m">${sections[1].questionNumber}. ${sections[1].label}</h2><p class="govuk-body govuk-body__text-block">${sections[1].answer}</p><hr class="govuk-!-margin-bottom-2"/>`,
      )
    })
  })

  describe('oasysTableTabs', () => {
    it('returns the tabs for the oasys tables', () => {
      const roshSummaries = cas1OasysGroupFactory.roshSummary().build().answers

      expect(oasysTableTabs({ roshSummaries })).toMatchStringIgnoringWhitespace(
        `<div class="govuk-grid-column-full" role="tabpanel" id="roshSummaries" aria-labelledby="roshSummariesTab" class="govuk-visually-hidden">
              ${oasysQuestions(roshSummaries)}
              </div>`,
      )
    })
  })
})

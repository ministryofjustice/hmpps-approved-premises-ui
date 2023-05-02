import { ApprovedPremisesAssessment as Assessment, OASysQuestion, OASysSections } from '../../@types/shared'
import { OasysImportArrays } from '../../@types/ui'

const oasysInformationFromAssessment = (assessment: Assessment): OASysSections =>
  assessment.application?.data?.['oasys-import'] || {}

const oasysQuestions = (section: Array<OASysQuestion>) =>
  section
    .map(
      question =>
        `<h2 class="govuk-heading-m">${question.questionNumber}. ${question.label}</h2><p class="govuk-body">${question.answer}</p><hr class="govuk-!-margin-bottom-2"/>`,
    )
    .join('')

const oasysTableTabs = (oasysSections: { [index: string]: OasysImportArrays }) =>
  Object.entries(oasysSections)
    .map(([sectionName, oasysSection]) => {
      return `<div class="govuk-grid-column-full" role="tabpanel" id="${sectionName}" aria-labelledby="${sectionName}Tab" hidden>
      ${oasysQuestions(oasysSection)}
      </div>`
    })
    .join('')

export { oasysInformationFromAssessment, oasysQuestions, oasysTableTabs }

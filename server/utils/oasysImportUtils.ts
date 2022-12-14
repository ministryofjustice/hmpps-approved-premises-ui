import { OasysImportArrays } from '../@types/ui'
import { Application, OASysQuestion, OASysSection } from '../@types/shared'
import { SessionDataError } from './errors'
import { escape } from './formUtils'

export const textareas = (questions: OasysImportArrays, key: 'roshAnswers' | 'offenceDetails') => {
  return questions
    .map(question => {
      return `<div class="govuk-form-group">
                <h3 class="govuk-label-wrapper">
                    <label class="govuk-label govuk-label--m" for=${key}[${question.questionNumber}]>
                        ${question.label}
                    </label>
                </h3>
                <textarea class="govuk-textarea" id=${key}[${question.questionNumber}] name=${key}[${
        question.questionNumber
      }] rows="8">${escape(question?.answer)}</textarea>
            </div>
            <hr>`
    })
    .join('')
}

export const oasysImportReponse = (
  answers: Array<string> | Record<string, string>,
  summaries: Array<OASysQuestion>,
) => {
  if (Array.isArray(answers)) {
    return (answers as Array<string>).reduce((prev, question, i) => {
      return {
        ...prev,
        [`${summaries[i].questionNumber}. ${summaries[i].label}`]: question,
      }
    }, {}) as Record<string, string>
  }
  if (!answers) {
    return {}
  }
  return answers
}

export const fetchOptionalOasysSections = (application: Application): Array<number> => {
  try {
    const oasysImport = application.data['oasys-import']

    if (!oasysImport) throw new SessionDataError('No OASys import section')

    const optionalOasysSections = oasysImport['optional-oasys-sections']

    if (!optionalOasysSections) throw new SessionDataError('No optional OASys imports')

    return [...optionalOasysSections.needsLinkedToReoffending, ...optionalOasysSections.otherNeeds].map(
      (oasysSection: OASysSection) => oasysSection.section,
    )
  } catch (e) {
    throw new SessionDataError(`Oasys supporting information error: ${e}`)
  }
}

import { DataServices, OasysImportArrays, OasysPage } from '../@types/ui'
import {
  ApprovedPremisesApplication as Application,
  ApprovedPremisesApplication,
  Cas1OASysGroup,
  Cas1OASysGroupName,
  Cas1OASysSupportingInformationQuestionMetaData,
  OASysQuestion,
  OASysSection,
} from '../@types/shared'

import { SessionDataError } from './errors'
import { escape } from './formUtils'
import { mapApiPersonRisksForUi, sentenceCase } from './utils'
import { OasysNotFoundError } from '../services/personService'
import oasysStubs from '../data/stubs/oasysStubs.json'
import { logToSentry } from '../../logger'

export type Constructor<T> = new (body: unknown) => T

export const getOasysSections = async <T extends OasysPage>(
  body: Record<string, unknown>,
  application: ApprovedPremisesApplication,
  token: string,
  dataServices: DataServices,
  constructor: Constructor<T>,
  {
    groupName,
    summaryKey,
    answerKey,
    selectedSections = [],
  }: {
    groupName: Cas1OASysGroupName
    summaryKey: string
    answerKey: string
    selectedSections?: Array<number>
  },
): Promise<T> => {
  let oasysGroup: Cas1OASysGroup
  let oasysSuccess: boolean

  try {
    oasysGroup = await dataServices.personService.getOasysAnswers(
      token,
      application.person.crn,
      groupName,
      selectedSections,
    )
    oasysSuccess = true
  } catch (error) {
    if (error instanceof OasysNotFoundError) {
      oasysGroup = {
        group: groupName,
        assessmentMetadata: {
          dateStarted: undefined,
          dateCompleted: undefined,
        },
        answers: oasysStubs[groupName],
      }

      oasysSuccess = false
    } else {
      throw error
    }
  }

  const summaries = sortOasysImportSummaries(oasysGroup.answers).map(question => {
    const answer =
      (body as Record<string, Record<string, string>>)[answerKey]?.[question.questionNumber] || question.answer
    return {
      ...question,
      answer,
    }
  })

  const page = new constructor(body)

  page.body[summaryKey] = summaries
  page[summaryKey as keyof OasysPage] = summaries as never
  page.oasysCompleted = oasysGroup?.assessmentMetadata?.dateCompleted || oasysGroup?.assessmentMetadata?.dateStarted
  page.oasysSuccess = oasysSuccess
  page.risks = mapApiPersonRisksForUi(application.risks)

  return page
}

export const textareas = (questions: OasysImportArrays, key: 'roshAnswers' | 'offenceDetails') => {
  return questions
    .map(question => {
      return `<div class="govuk-form-group">
                <h2 class="govuk-label-wrapper">
                    <label class="govuk-label govuk-label--m" for=${key}[${question.questionNumber}]>
                        ${question.label}
                    </label>
                </h2>
                <textarea class="govuk-textarea" id=${key}[${question.questionNumber}] name=${key}[${
                  question.questionNumber
                }] rows="8">${escape(question?.answer)}</textarea>
            </div>
            <hr>`
    })
    .join('')
}

export const oasysImportReponse = (answers: Record<string, string>, summaries: Array<OASysQuestion>) => {
  return Object.keys(answers).reduce((prev, k) => {
    return {
      ...prev,
      [`${k}: ${findSummaryLabel(k, summaries)}`]: answers[k],
    }
  }, {}) as Record<string, string>
}

export const findSummaryLabel = (questionNumber: string, summaries: Array<OASysQuestion>): string => {
  let summary: OASysQuestion | undefined = summaries.find(i => i.questionNumber === questionNumber)

  if (!summary) {
    logToSentry(
      `OASys summary not found for question number: ${questionNumber}. Summaries ${JSON.stringify(summaries)}`,
    )
    summary = { label: '', questionNumber }
  }

  return summary.label
}

export const fetchOptionalOasysSections = (application: Application): Array<number> => {
  try {
    const oasysImport = application.data['oasys-import']

    if (!oasysImport) throw new SessionDataError('No OASys import section')

    const optionalOasysSections = oasysImport['optional-oasys-sections']

    if (!optionalOasysSections) throw new SessionDataError('No optional OASys imports')

    return [...optionalOasysSections.needsLinkedToReoffending, ...optionalOasysSections.otherNeeds]
      .map((oasysSection: OASysSection) => oasysSection?.section)
      .filter(section => !!section)
  } catch (error) {
    throw new SessionDataError(`Oasys supporting information error: ${error}`)
  }
}

export const sortOasysImportSummaries = (summaries: Array<OASysQuestion>): Array<OASysQuestion> => {
  return (summaries || []).sort((a, b) => a.questionNumber.localeCompare(b.questionNumber, 'en', { numeric: true }))
}

export const sectionCheckBoxes = (
  fullList: Array<Cas1OASysSupportingInformationQuestionMetaData>,
  selectedList: Array<Cas1OASysSupportingInformationQuestionMetaData>,
) => {
  return fullList.map(need => {
    const sectionAndName = `${need.section}. ${sentenceCase(need.sectionLabel)}`
    return {
      value: need.section.toString(),
      text: sectionAndName,
      checked: selectedList
        .filter(Boolean)
        .map(n => n.section)
        .includes(need.section),
    }
  })
}

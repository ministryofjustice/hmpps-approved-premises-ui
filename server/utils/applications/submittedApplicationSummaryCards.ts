import {
  ApprovedPremisesApplication as Application,
  ApprovedPremisesAssessment as Assessment,
} from '../../@types/shared'
import { FormSections, SummaryListItem, UiTask } from '../../@types/ui'
import Apply from '../../form-pages/apply'
import { documentsFromApplication } from '../assessments/documentUtils'
import { getActionsForTaskId } from '../assessments/getActionsForTaskId'
import { linebreaksToParagraphs } from '../utils'
import { embeddedSummaryListItem } from './summaryListUtils/embeddedSummaryListItem'
import Assess from '../../form-pages/assess'

type QuestionResponse = string | Array<Record<string, unknown>>

type PageResponse = Record<string, QuestionResponse>

type TaskResponse = Array<PageResponse>

const isApplication = (submittedForm?: Application | Assessment): submittedForm is Application =>
  'person' in (submittedForm as Application)

export class SumbmittedApplicationSummaryCards {
  sections: FormSections

  constructor(
    private readonly submittedForm: Application | Assessment,
    private readonly assessmentId?: string,
    readonly sectionsToRender?: FormSections,
  ) {
    if (sectionsToRender) {
      this.sections = sectionsToRender
    } else {
      this.sections = (isApplication(submittedForm) ? Apply : Assess).sections.slice(0, -1)
    }
  }

  get response() {
    return this.sections.map(section => {
      return {
        title: section.title,
        tasks: section.tasks.map(task => this.taskToSummaryCard(task)),
      }
    })
  }

  taskToSummaryCard = (task: UiTask) => {
    return {
      card: {
        title: { text: task.title, headingLevel: 2 },
        actions: this.assessmentId ? getActionsForTaskId(task.id, this.assessmentId) : undefined,
        attributes: {
          'data-cy-section': task.id,
        },
      },
      rows: this.summaryCardRowsForTaskId(task.id),
    }
  }

  summaryCardRowsForTaskId = (taskId: string): Array<SummaryListItem> => {
    const pages = (this.submittedForm.document?.[taskId] as TaskResponse) || []
    if (taskId === 'attach-required-documents') {
      return this.summaryCardRowsForDocuments()
    }
    return pages.flatMap(page => {
      return Object.keys(page).map(question => {
        const answer = page[question]
        return this.questionToSummaryCardRow(question, answer)
      })
    })
  }

  summaryCardRowsForDocuments = (): Array<SummaryListItem> => {
    if (isApplication(this.submittedForm)) {
      const { crn } = this.submittedForm.person
      return documentsFromApplication(this.submittedForm).map(document => ({
        key: {
          html: `<a href="/applications/people/${crn}/documents/${document.id}" data-debounce-link data-cy-documentId="${document.id}">${document.fileName}</a>`,
        },
        value: { text: document?.description || '' },
      }))
    }

    return undefined
  }

  questionToSummaryCardRow = (question: string, answer: QuestionResponse): SummaryListItem => {
    const value =
      typeof answer === 'string' || answer instanceof String
        ? { html: linebreaksToParagraphs(answer as string) }
        : { html: embeddedSummaryListItem(answer) }

    return {
      key: { text: question },
      value,
    }
  }
}

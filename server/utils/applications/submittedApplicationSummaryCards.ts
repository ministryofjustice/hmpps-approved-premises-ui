import { ApprovedPremisesApplication as Application } from '../../@types/shared'
import { FormSections, SummaryListItem, UiTask } from '../../@types/ui'
import Apply from '../../form-pages/apply'
import { documentsFromApplication } from '../assessments/documentUtils'
import { getActionsForTaskId } from '../assessments/getActionsForTaskId'
import { linebreaksToParagraphs } from '../utils'
import { embeddedSummaryListItem } from './summaryListUtils/embeddedSummaryListItem'

type QuestionResponse = string | Array<Record<string, unknown>>

type PageResponse = Record<string, QuestionResponse>

type TaskResponse = Array<PageResponse>

export class SumbmittedApplicationSummaryCards {
  constructor(
    private readonly application: Application,
    private readonly assessmentId?: string,
    private readonly sections: FormSections = Apply.sections.slice(0, -1), // Defaults to all Apply sections except the final "Check your answers" section
  ) {}

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
    const pages = (this.application.document?.[taskId] as TaskResponse) || []
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
    return documentsFromApplication(this.application).map(document => ({
      key: {
        html: `<a href="/applications/people/${this.application.person.crn}/documents/${document.id}" data-cy-documentId="${document.id}">${document.fileName}</a>`,
      },
      value: { text: document?.description || '' },
    }))
  }

  questionToSummaryCardRow = (question: string, anwser: QuestionResponse): SummaryListItem => {
    const value =
      typeof anwser === 'string' || anwser instanceof String
        ? { html: linebreaksToParagraphs(anwser as string) }
        : { html: embeddedSummaryListItem(anwser) }

    return {
      key: { text: question },
      value,
    }
  }
}

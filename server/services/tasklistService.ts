import { Cas1Application as Application, Cas1Assessment as Assessment } from '@approved-premises/api'
import { FormSections, JourneyType, TaskNames, TaskStatus, TaskWithStatus, UiTask } from '@approved-premises/ui'
import getSections from '../utils/assessments/getSections'
import Apply from '../form-pages/apply'
import PreArrival from '../form-pages/residence/pre-arrival'
import isAssessment from '../utils/assessments/isAssessment'
import getTaskStatus from '../form-pages/utils/getTaskStatus'
import { taskLink, taskLinkHtml, TaskListStatusTag } from '../utils/taskListUtils'

export default class TasklistService {
  taskStatuses: Record<string, TaskStatus>

  formSections: FormSections

  constructor(
    private readonly applicationOrAssessment: Application | Assessment,
    journey?: JourneyType,
    private readonly data?: unknown,
    private readonly taskPathRoot?: string,
  ) {
    if (journey === 'pre-arrival') this.formSections = PreArrival.sections
    if (applicationOrAssessment && isAssessment(applicationOrAssessment))
      this.formSections = getSections(applicationOrAssessment)
    if (applicationOrAssessment && !isAssessment(applicationOrAssessment)) this.formSections = Apply.sections

    this.taskStatuses = {}

    this.formSections.forEach(section => {
      section.tasks.forEach(task => {
        const previousTaskKey = Object.keys(this.taskStatuses).at(-1)
        const previousTaskStatus = this.taskStatuses[previousTaskKey]

        if (!previousTaskStatus || previousTaskStatus === 'complete') {
          this.taskStatuses[task.id] = getTaskStatus(
            task,
            applicationOrAssessment,
            data || applicationOrAssessment?.data,
          )
        } else {
          this.taskStatuses[task.id] = 'cannot_start'
        }
      })
    })
  }

  get completeSectionCount() {
    return this.formSections.filter(section => {
      const taskIds: Array<TaskNames> = section.tasks.map(s => s.id)
      const completeTasks = Object.keys(this.taskStatuses)
        .filter((k: TaskNames) => taskIds.includes(k))
        .filter(k => this.taskStatuses[k] === 'complete')
      return completeTasks.length === taskIds.length
    }).length
  }

  get sections() {
    return this.formSections.map((s, i) => {
      const tasks = s.tasks.map(t => this.addStatusToTask(t))

      return { sectionNumber: i + 1, title: s.title, tasks }
    })
  }

  get status() {
    const completeTasks = Object.values(this.taskStatuses).filter(t => t === 'complete')
    return completeTasks.length === Object.keys(this.taskStatuses).length ? 'complete' : 'incomplete'
  }

  addStatusToTask(task: UiTask): TaskWithStatus {
    const status = this.taskStatuses[task.id]
    const withStatus: TaskWithStatus = { ...task, status }
    const linkHtml: string = taskLinkHtml(withStatus, this.applicationOrAssessment, this.taskPathRoot)
    const link: string = taskLink(withStatus, this.applicationOrAssessment, this.taskPathRoot)
    const tagHtml = new TaskListStatusTag(status, task.id).html()
    return { ...withStatus, link, linkHtml, tagHtml }
  }
}

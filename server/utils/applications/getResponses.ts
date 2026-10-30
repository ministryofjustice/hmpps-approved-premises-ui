import { Cas1Application } from '@approved-premises/api'
import { isObject } from 'underscore'
import { FormArtifact, ObjectWithDateParts, PageResponse, TaskData } from '../../@types/ui'
import { forPagesInTask } from './forPagesInTask'
import { ApplicationOrAssessmentResponse } from './utils'
import { getSections } from '../../form-pages/utils/getPage'
import { TasklistPageInterface } from '../../form-pages/tasklistPage'
import { FieldDefn } from '../../form-pages/utils'
import { DateFormats } from '../dateUtils'

export const getResponses = (formArtifact: FormArtifact): ApplicationOrAssessmentResponse => {
  const responses: Record<string, Array<PageResponse>> = {}

  const formSections = getSections(formArtifact)

  formSections.forEach(section => {
    section.tasks.forEach(task => {
      const responsesForTask: Array<PageResponse> = []

      forPagesInTask(formArtifact, task, page => responsesForTask.push(page.response()))

      responses[task.id] = responsesForTask
    })
  })

  return responses
}

export const getGlobalApplicationData = (application: Cas1Application): TaskData => {
  const globalData: TaskData = {}

  const formSections = getSections(application)

  formSections.forEach(section => {
    section.tasks.forEach(task => {
      // const responsesForTask: Array<PageResponse> = []

      forPagesInTask(application, task, page => {
        const Page: TasklistPageInterface = Object.getPrototypeOf(page).constructor
        const mapping = Page.getPrefillMapping && Page.getPrefillMapping()

        if (mapping) {
          console.log('**** body', page.name, mapping, page.body)
          Object.entries(mapping).forEach(entry => {
            const [fromKey, defn]: [string, FieldDefn] = entry
            let value: unknown = page.body[fromKey]
            if (isObject(defn)) {
              if (defn.type === 'DATE') {
                value = DateFormats.dateAndTimeInputsToIsoString(page.body as ObjectWithDateParts<string>, fromKey)[fromKey]
              }
            }

            if (value) {
              globalData[isObject(defn) ? defn.fieldName : defn] = value
            }
          })
        }
      })
    })
  })
  console.log('**** Global data', globalData)
  return globalData
}

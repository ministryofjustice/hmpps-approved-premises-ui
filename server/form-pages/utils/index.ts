import type { Request } from 'express'
import type { FormArtifact, JourneyType, UiTask, YesOrNo, YesOrNoWithDetail } from '@approved-premises/ui'
import TasklistPage, { TasklistPageInterface } from '../tasklistPage'
import { sentenceCase } from '../../utils/utils'

export const applyYesOrNo = <K extends string>(key: K, body: Record<string, unknown>): YesOrNoWithDetail<K> => {
  return {
    [`${key}`]: body[`${key}`] as YesOrNo,
    [`${key}Detail`]: body[`${key}Detail`] as string,
  } as YesOrNoWithDetail<K>
}

export const yesOrNoResponseWithDetailForYes = <K extends string>(key: K, body: Record<string, unknown>) => {
  return body[key] === 'yes' ? `Yes - ${body[`${key}Detail`]}` : 'No'
}

export const yesOrNoResponseWithDetailForNo = <K extends string>(key: K, body: Record<string, unknown>) => {
  return body[key] === 'no' ? `No - ${body[`${key}Detail`]}` : 'Yes'
}

export const yesNoOrDontKnowResponseWithDetail = <K extends string>(key: K, body: Record<string, string>) => {
  return body[key] === 'iDontKnow' ? "Don't know" : yesOrNoResponseWithDetailForYes<K>(key, body)
}

export const getTask = <T extends Record<string, unknown>>(task: T) => {
  const taskPages: Record<string, unknown> = {}
  const slug = Reflect.getMetadata('task:slug', task)
  const name = Reflect.getMetadata('task:name', task)
  const pageClasses = Reflect.getMetadata('task:pages', task)

  pageClasses.forEach(<PageType extends Record<string, unknown>>(page: PageType) => {
    const pageName: string = Reflect.getMetadata('page:name', page)
    taskPages[pageName] = page
  })

  return {
    id: slug,
    title: name,
    pages: taskPages,
  }
}

export const getSection = <T extends Record<string, unknown>>(section: T) => {
  const tasks: Array<UiTask> = []
  const title = Reflect.getMetadata('section:title', section)
  const name = Reflect.getMetadata('section:name', section)
  const taskClasses = Reflect.getMetadata('section:tasks', section)

  taskClasses.forEach(<PageType extends Record<string, unknown>>(task: PageType) => {
    tasks.push(getTask(task))
  })

  return {
    title,
    name,
    tasks,
  }
}

export const getPagesForSections = <T extends Record<string, unknown>>(sections: Array<T>) => {
  const pages: Record<string, unknown> = {}
  sections.forEach(sectionClass => {
    const section = getSection(sectionClass)
    const { tasks } = section
    tasks.forEach(t => {
      pages[t.id] = t.pages
    })
  })
  return pages
}

export const viewPath = <T extends TasklistPage>(page: T, journeyType: JourneyType) => {
  const pageName = getPageName(page.constructor)
  const taskName = getTaskName(page.constructor)

  return `${journeyType}/pages/${taskName}/${pageName}`
}

export const getPageName = <T extends TasklistPageInterface['constructor']>(page: T) => {
  return Reflect.getMetadata('page:name', page)
}

export const getTaskName = <T extends TasklistPageInterface['constructor']>(page: T) => {
  return Reflect.getMetadata('page:task', page)
}

export function getBody(
  Page: TasklistPageInterface,
  application: FormArtifact,
  request: Request,
  userInput: Record<string, unknown>,
) {
  if (userInput && Object.keys(userInput).length) {
    return userInput
  }
  if (Object.keys(request.body).length) {
    return request.body
  }
  return pageDataFromApplicationOrAssessment(Page, application)
}

export function pageDataFromApplicationOrAssessment(Page: TasklistPageInterface, application: FormArtifact) {
  const pageName = getPageName(Page)
  const taskName = getTaskName(Page)

  return application.data?.[taskName]?.[pageName] || {}
}

export const responsesForYesNoAndCommentsSections = (
  sections: Record<string, string>,
  body: Record<string, string>,
) => {
  return Object.keys(sections).reduce(
    (prev, section) => {
      const response = {
        ...prev,
        [sections[section]]: sentenceCase(body[section]),
      }

      if (body[`${section}Comments`]) {
        response[`${sections[section]} Additional comments`] = body[`${section}Comments`]
      }

      return response
    },
    {} as Record<string, unknown>,
  )
}

export const pageBodyShallowEquals = (body1: Record<string, unknown>, body2: Record<string, unknown>) => {
  const body1Keys = Object.keys(body1)
  const body2Keys = Object.keys(body2)

  if (body1Keys.length !== body2Keys.length) {
    return false
  }

  return body1Keys.every(key => {
    const value1 = body1[key]
    const value2 = body2[key]

    if (Array.isArray(value1) && Array.isArray(value2)) {
      return value1.length === value2.length && value1.every((arrayValue, index) => arrayValue === value2[index])
    }
    return value1 === value2
  })
}

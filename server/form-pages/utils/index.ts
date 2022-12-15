import type { YesOrNoWithDetail, YesOrNo, Task } from '@approved-premises/ui'

export const applyYesOrNo = <K extends string>(key: K, body: Record<string, unknown>): YesOrNoWithDetail<K> => {
  return {
    [`${key}`]: body[`${key}`] as YesOrNo,
    [`${key}Detail`]: body[`${key}Detail`] as string,
  } as YesOrNoWithDetail<K>
}

export const yesOrNoResponseWithDetail = <K extends string>(key: K, body: Record<string, string>) => {
  return body[key] === 'yes' ? `Yes - ${body[`${key}Detail`]}` : 'No'
}

export const yesNoOrDontKnowResponseWithDetail = <K extends string>(key: K, body: Record<string, string>) => {
  return body[key] === 'iDontKnow' ? "Don't know" : yesOrNoResponseWithDetail<K>(key, body)
}

export const getTask = <T>(task: T) => {
  const taskPages = {}
  const slug = Reflect.getMetadata('task:slug', task)
  const name = Reflect.getMetadata('task:name', task)
  const pageClasses = Reflect.getMetadata('task:pages', task)

  pageClasses.forEach(<PageType>(page: PageType) => {
    const pageName = Reflect.getMetadata('page:name', page)
    taskPages[pageName] = page
  })

  return {
    id: slug,
    title: name,
    pages: taskPages,
  }
}

export const getSection = <T>(section: T) => {
  const tasks: Array<Task> = []
  const name = Reflect.getMetadata('section:name', section)
  const taskClasses = Reflect.getMetadata('section:tasks', section)

  taskClasses.forEach(<PageType>(task: PageType) => {
    tasks.push(getTask(task))
  })

  return {
    title: name,
    tasks,
  }
}

export const getPagesForSections = <T>(sections: Array<T>) => {
  const pages = {}
  sections.forEach(sectionClass => {
    const section = getSection(sectionClass)
    const { tasks } = section
    tasks.forEach(t => {
      pages[t.id] = t.pages
    })
  })
  return pages
}

export const viewPath = <T>(page: T) => {
  const pageName = getPageName(page)
  const taskName = getTaskName(page)

  return `applications/pages/${taskName}/${pageName}`
}

export const getPageName = <T>(page: T) => {
  return Reflect.getMetadata('page:name', page.constructor)
}

export const getTaskName = <T>(page: T) => {
  return Reflect.getMetadata('page:task', page.constructor)
}

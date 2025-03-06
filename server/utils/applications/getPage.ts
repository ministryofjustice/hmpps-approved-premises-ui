import { JourneyType, TaskNames } from '../../@types/ui'
import { TasklistPageInterface } from '../../form-pages/tasklistPage'
import { UnknownPageError } from '../errors'
import { journeyPages } from './utils'

export const getPage = (taskName: TaskNames, pageName: string, journeyType: JourneyType): TasklistPageInterface => {
  const pageList = journeyPages(journeyType)[taskName]

  const Page = pageList[pageName]

  if (!Page) {
    throw new UnknownPageError(pageName)
  }

  return Page as TasklistPageInterface
}

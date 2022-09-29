import type { ApplicationData, TaskNames } from 'approved-premises'
import { Request } from 'express'
import config from '../config'
import pages from '../form-pages/apply'
import taskLookup from '../i18n/en/tasks.json'
import paths from '../paths/approved-premises/apply'

const getTaskStatus = (task: TaskNames, application: ApplicationData): string => {
  if (!application[task]) {
    return `<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="${task}-status">Not started</strong>`
  }
  return `<strong class="govuk-tag app-task-list__tag" id="${task}-status">Completed</strong>`
}

const taskLink = (task: TaskNames, id: string): string => {
  const firstPage = Object.keys(pages[task])[0]

  return `<a href="${paths.applications.pages.show({
    id,
    task,
    page: firstPage,
  })}" aria-describedby="eligibility-${task}" data-cy-task-name="${task}">${taskLookup[task]}</a>`
}

const getService = (req: Request): 'approved-premises' | 'temporary-accommodation' => {
  if (config.serviceSignifier === 'approved-premises-only') {
    return 'approved-premises'
  }
  if (config.serviceSignifier === 'temporary-accommodation-only') {
    return 'temporary-accommodation'
  }
  if (config.serviceSignifier === 'domain') {
    const subdomain = req.subdomains[req.subdomains.length - 1]

    if (subdomain === config.approvedPremisesSubdomain) {
      return 'approved-premises'
    }
    if (subdomain === config.temporaryAccommodationSubdomain) {
      return 'temporary-accommodation'
    }
  }
  if (config.serviceSignifier === 'path') {
    if (req.path.startsWith(`/${config.approvedPremisesRootPath}`)) {
      return 'approved-premises'
    }
    if (req.path.startsWith(`/${config.temporaryAccommodationRootPath}`)) {
      return 'temporary-accommodation'
    }
  }

  return 'approved-premises'
}

export { getTaskStatus, taskLink, getService }

import { ApprovedPremisesApplication as Application } from '../@types/shared'

export const addResponseToApplication = (
  application: Application,
  { section, page, key, value }: { section: string; page: string; key?: string; value?: unknown },
) => {
  application.data = {
    ...application.data,
    [section]: {
      ...application.data[section],
      [page]: key && { [key]: value },
    },
  }

  return application
}

export const addResponsesToApplication = (
  application: Application,
  { section, page, keyValuePairs }: { section: string; page: string; keyValuePairs?: Record<string, unknown> },
) => {
  application.data = {
    ...application.data,
    [section]: {
      ...application.data[section],
      [page]: { ...application.data[section][page], ...keyValuePairs },
    },
  }

  return application
}

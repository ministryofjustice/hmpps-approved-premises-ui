import { ApprovedPremisesApplication as Application } from '../@types/shared'

export const addResponseToApplication = (
  application: Application,
  { section, page, key, value }: { section: string; page: string; key: string; value: unknown },
) => {
  application.data = {
    ...application.data,
    [section]: {
      ...application.data[section],
      [page]: { [key]: value },
    },
  }

  return application
}

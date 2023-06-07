import { FormArtifact } from '../@types/ui'

export const addResponseToFormArtifact = (
  formArtifact: FormArtifact,
  { section, page, key, value }: { section: string; page: string; key?: string; value?: unknown },
) => {
  formArtifact.data = {
    ...formArtifact.data,
    [section]: {
      ...formArtifact.data[section],
      [page]: key && { [key]: value },
    },
  }

  return formArtifact
}

export const addResponsesToFormArtifact = (
  formArtifact: FormArtifact,
  { section, page, keyValuePairs }: { section: string; page: string; keyValuePairs?: Record<string, unknown> },
) => {
  formArtifact.data = {
    ...formArtifact.data,
    [section]: {
      ...formArtifact.data[section],
      [page]: { ...formArtifact.data[section][page], ...keyValuePairs },
    },
  }

  return formArtifact
}

import { FormArtifact } from '../@types/ui'

export const addResponseToFormArtifact = <T extends FormArtifact>(
  formArtifact: T,
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

export const addResponsesToFormArtifact = <T extends FormArtifact>(
  formArtifact: T,
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

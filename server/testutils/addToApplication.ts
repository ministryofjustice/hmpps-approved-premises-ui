import { FormArtifact } from '../@types/ui'

export const addResponseToFormArtifact = <T extends FormArtifact>(
  formArtifact: T,
  { task, page, key, value }: { task: string; page: string; key?: string; value?: unknown },
) => {
  formArtifact.data = {
    ...formArtifact.data,
    [task]: {
      ...formArtifact.data[task],
      [page]: key && { [key]: value },
    },
  }

  return formArtifact as T
}

export const addResponsesToFormArtifact = <T extends FormArtifact>(
  formArtifact: T,
  { task, page, keyValuePairs }: { task: string; page: string; keyValuePairs?: Record<string, unknown> },
) => {
  formArtifact.data = {
    ...formArtifact.data,
    [task]: {
      ...formArtifact.data[task],
      [page]: { ...formArtifact.data[task][page], ...keyValuePairs },
    },
  }

  return formArtifact as T
}

export interface GetSessionsRequest {
  username: string
  teamId: number
  startDate: string
  endDate: string
}

export type GovUkStatusTagColour = 'grey' | 'red' | 'yellow'

export type GovUKTableRow = { text: string } | { html: string }

export type ValidationErrors<T> = Partial<Record<keyof T, Record<'text', string>>>

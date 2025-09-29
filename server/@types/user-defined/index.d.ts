export interface GetSessionsRequest {
  username: string
  teamId: number
  startDate: string
  endDate: string
}

export type GovUkStatusTagColour = 'grey' | 'red' | 'yellow'

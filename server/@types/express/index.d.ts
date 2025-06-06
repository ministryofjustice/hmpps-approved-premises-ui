import type { ErrorMessages } from '@approved-premises/ui'
import type { ApprovedPremisesApplication, PlacementApplicationDecisionEnvelope } from '@approved-premises/api'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    application: ApprovedPremisesApplication
    user: UserDetails
    placementApplicationDecisions: Record<string, Partial<PlacementApplicationDecisionEnvelope>>
    messages: Array<string>
    pageReferers: Record<string, string>
    multiPageFormData: MultiPageFormData
  }
}

declare module 'express' {
  interface TypedRequest<T extends Query, U = Body> extends Express.Request {
    body: U
    params: T
  }

  interface TypedRequestHandler<T, U = Response> extends Express.RequestHandler {
    (req: T, res: U, next: () => void): void
  }

  interface ShowParams {
    id: string
  }

  type ShowRequest = TypedRequest<ShowParams>

  type ShowRequestHandler = TypedRequestHandler<ShowParams>
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string

      logout(done: (err: unknown) => void): void

      flash(type: string, message: string | ErrorMessages | Array<ErrorSummary> | Record<string, unknown>): number
    }
  }
}

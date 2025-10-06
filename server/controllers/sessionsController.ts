import type { Request, RequestHandler, Response } from 'express'
import ProviderService from '../services/providerService'
import SessionService from '../services/sessionService'
import SessionUtils from '../utils/sessionUtils'
import TrackProgressPage, { TrackProgressPageInput } from '../pages/trackProgressPage'

export default class SessionsController {
  constructor(
    private readonly providerService: ProviderService,
    private readonly sessionService: SessionService,
  ) {}

  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const providerId = '1000'
      const teamItems = await this.getTeams(providerId, res)

      res.render('sessions/index', { teamItems })
    }
  }

  search(): RequestHandler {
    return async (_req: Request, res: Response) => {
      let teamItems

      // Assigning the query object to a standard object prototype to resolve TypeError: Cannot convert object to primitive value
      const query = { ..._req.query }
      const teamCode = query.team?.toString() ?? undefined

      try {
        const providerId = '1000'
        teamItems = await this.getTeams(providerId, res, teamCode)
      } catch {
        throw new Error('Something went wrong')
      }

      const page = new TrackProgressPage(_req.query)
      const validationErrors = page.validationErrors()
      const pageSearchValues = page.items()

      try {
        if (Object.keys(validationErrors).length !== 0) {
          throw new Error('Validation error')
        }

        const startDate = `${query['startDate-year']}-${query['startDate-month']}-${query['startDate-day']}`
        const endDate = `${query['endDate-year']}-${query['endDate-month']}-${query['endDate-day']}`

        const sessions = await this.sessionService.getSessions({
          username: res.locals.user.username,
          teamCode,
          startDate,
          endDate,
        })

        res.render('sessions/index', {
          ...pageSearchValues,
          teamItems,
          sessionRows: SessionUtils.sessionResultTableRows(sessions),
        })
      } catch {
        const errorSummary = Object.keys(validationErrors).map(k => ({
          text: validationErrors[k as keyof TrackProgressPageInput].text,
          href: `#${k}`,
        }))

        res.render('sessions/index', {
          errorSummary,
          errors: validationErrors,
          teamItems,
          sessionRows: [],
          ...pageSearchValues,
        })
      }
    }
  }

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { id } = _req.params
      const { date } = _req.query
      const session = await this.sessionService.getSession(res.locals.user.username, id, date.toString())
      const sessionList = SessionUtils.sessionListTableRows(session.appointmentSummaries)

      res.render('sessions/show', { session, sessionList })
    }
  }

  private async getTeams(providerId: string, res: Response, teamCode: string | undefined = undefined) {
    const teams = await this.providerService.getTeams(providerId, res.locals.user.username)

    const teamItems = teams.providers.map(team => {
      const selected = teamCode ? team.code === teamCode : undefined

      return {
        value: team.code,
        text: team.name,
        selected,
      }
    })
    return teamItems
  }
}

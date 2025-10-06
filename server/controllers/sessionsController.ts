import type { Request, RequestHandler, Response } from 'express'
import ProviderService from '../services/providerService'
import SessionService from '../services/sessionService'
import GovukFrontendDateInput from '../forms/GovukFrontendDateInput'
import SessionUtils from '../utils/sessionUtils'

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
      // Assigning the query object to a standard object prototype to resolve TypeError: Cannot convert object to primitive value
      const query = { ..._req.query }
      const startDateInput = new GovukFrontendDateInput(query, 'startDate')
      const endDateInput = new GovukFrontendDateInput(query, 'endDate')

      const teamId = Number(query.team)
      const startDate = `${query['startDate-year']}-${query['startDate-month']}-${query['startDate-day']}`
      const endDate = `${query['endDate-year']}-${query['endDate-month']}-${query['endDate-day']}`

      const pageSearchValues = {
        startDateItems: startDateInput.items,
        endDateItems: endDateInput.items,
      }

      try {
        const providerId = '1000'
        const teamItems = await this.getTeams(providerId, res, teamId)

        const sessions = await this.sessionService.getSessions({
          username: res.locals.user.username,
          teamId,
          startDate,
          endDate,
        })

        res.render('sessions/index', {
          ...pageSearchValues,
          teamItems,
          sessionRows: SessionUtils.sessionResultTableRows(sessions),
        })
      } catch {
        // Response error handling to be added
        res.render('sessions/index', { ...pageSearchValues, teamItems: [], sessionRows: [] })
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

  private async getTeams(providerId: string, res: Response, teamId: number | undefined = undefined) {
    const teams = await this.providerService.getTeams(providerId, res.locals.user.username)

    const teamItems = teams.providers.map(team => {
      const selected = teamId ? team.id === teamId : undefined

      return {
        value: team.id,
        text: team.name,
        selected,
      }
    })
    return teamItems
  }
}

import type { Request, RequestHandler, Response } from 'express'
import ProviderService from '../services/providerService'
import { ProjectAllocationDto } from '../@types/shared'

export default class SessionsController {
  constructor(private readonly providerService: ProviderService) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const providerId = '1000'
      const teams = await this.providerService.getTeams(providerId, res.locals.user.username)

      const teamItems = teams.providers.map(team => ({
        value: team.id,
        text: team.name,
      }))

      const sessions: Array<ProjectAllocationDto> = []

      res.render('sessions/show', { teamItems, sessions })
    }
  }
}

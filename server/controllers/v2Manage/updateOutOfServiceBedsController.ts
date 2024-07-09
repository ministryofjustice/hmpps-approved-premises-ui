import type { Request, RequestHandler, Response } from 'express'
import { OutOfServiceBedService, PremisesService } from '../../services'
import { DateFormats } from '../../utils/dateUtils'

export default class OutOfServiceBedsController {
  constructor(
    private readonly outOfServiceBedService: OutOfServiceBedService,
    private readonly premisesService: PremisesService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedId, id } = req.params

      const outOfServiceBedReasons = await this.outOfServiceBedService.getOutOfServiceBedReasons(req.user.token)
      const outOfServiceBed = await this.outOfServiceBedService.getOutOfServiceBed(req.user.token, premisesId, id)

      res.render('v2Manage/outOfServiceBeds/update', {
        pageHeading: 'updateOutOfServiceBedsController',
        premisesId,
        bedId,
        id,
        outOfServiceBedReasons,
        outOfServiceBed,
        ...DateFormats.isoDateToDateInputs(outOfServiceBed.startDate, 'startDate'),
        ...DateFormats.isoDateToDateInputs(outOfServiceBed.endDate, 'endDate'),
      })
    }
  }
}

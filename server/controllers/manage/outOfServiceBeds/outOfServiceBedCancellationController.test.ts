import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { OutOfServiceBedService } from '../../../services'
import { outOfServiceBedFactory, userDetailsFactory } from '../../../testutils/factories'
import OutOfServiceBedCancellationController from './outOfServiceBedCancellationController'
import paths from '../../../paths/manage'

describe('OutOfServiceBedCancellationController', () => {
  const token = 'SOME_TOKEN'
  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const outOfServiceBedService = createMock<OutOfServiceBedService>({})

  const outOfServiceBedCancellationController = new OutOfServiceBedCancellationController(outOfServiceBedService)
  const outOfServiceBed = outOfServiceBedFactory.build()
  const {
    id,
    bed: { id: bedId },
    premises: { id: premisesId },
  } = outOfServiceBed

  beforeEach(() => {
    jest.resetAllMocks()
    request = createMock<Request>({
      user: { token },
      session: {
        user: userDetailsFactory.build(),
      },
      params: {
        premisesId,
        bedId,
      },
    })
    outOfServiceBedService.getOutOfServiceBed.mockResolvedValue(outOfServiceBed)
  })

  describe('new', () => {
    it('renders the outOfService bed cancellation confirmation page', async () => {
      const requestHandler = outOfServiceBedCancellationController.new()
      request.params = { premisesId, bedId, id }

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/outOfServiceBeds/cancel',
        expect.objectContaining({
          backLink: paths.outOfServiceBeds.show({ premisesId, bedId, id, tab: 'details' }),
          submitLink: paths.outOfServiceBeds.cancel({ premisesId, bedId, id }),
          outOfServiceBed,
        }),
      )

      expect(outOfServiceBedService.getOutOfServiceBed).toHaveBeenCalledWith(
        request.user.token,
        request.params.premisesId,
        outOfServiceBed.id,
      )
    })
  })

  describe('cancel', () => {
    it('cancels an outOfService bed and redirects to the outOfService beds index page', async () => {
      outOfServiceBedService.cancelOutOfServiceBed.mockResolvedValue(outOfServiceBed)

      const requestHandler = outOfServiceBedCancellationController.cancel()

      request.params = {
        premisesId,
        bedId: outOfServiceBed.bed.id,
        id: outOfServiceBed.id,
      }

      await requestHandler(request, response, next)

      expect(outOfServiceBedService.cancelOutOfServiceBed).toHaveBeenCalledWith(
        request.user.token,
        outOfServiceBed.id,
        request.params.premisesId,
        {},
      )
      expect(request.flash).toHaveBeenCalledWith(
        'success',
        `Cancelled out of service bed for ${outOfServiceBed.room.name} ${outOfServiceBed.bed.name}`,
      )
      expect(response.redirect).toHaveBeenCalledWith(
        paths.outOfServiceBeds.premisesIndex({
          premisesId: request.params.premisesId,
          temporality: 'current',
        }),
      )
    })
  })
})

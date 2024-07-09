import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { when } from 'jest-when'

import { OutOfServiceBedService, PremisesService } from '../../services'
import { outOfServiceBedFactory } from '../../testutils/factories'
import UpdateOutOfServiceBedsController from './updateOutOfServiceBedsController'

import { DateFormats } from '../../utils/dateUtils'

describe('updateOutOfServiceBedController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const outOfServiceBedService = createMock<OutOfServiceBedService>({})
  const premisesService = createMock<PremisesService>({})

  const updateOutOfServiceBedController = new UpdateOutOfServiceBedsController(outOfServiceBedService, premisesService)
  const premisesId = 'premisesId'
  const outOfServiceBed = outOfServiceBedFactory.build()

  beforeEach(() => {
    jest.resetAllMocks()
    request = createMock<Request>({
      user: { token },
      params: {
        premisesId,
        bedId: outOfServiceBed.bed.id,
        id: outOfServiceBed.id,
      },
    })
    when(outOfServiceBedService.getOutOfServiceBed)
      .calledWith(request.user.token, premisesId, outOfServiceBed.id)
      .mockResolvedValue(outOfServiceBed)
  })

  describe('new', () => {
    it('passes the premises, bed and OoS bed IDs through to the view when called', async () => {
      const requestHandler = updateOutOfServiceBedController.new()

      request.params = {
        premisesId,
        bedId: outOfServiceBed.bed.id,
        id: outOfServiceBed.id,
      }

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'v2Manage/outOfServiceBeds/update',
        expect.objectContaining({
          premisesId: request.params.premisesId,
          bedId: request.params.bedId,
          id: request.params.id,
        }),
      )
    })

    it('calls the OoS bed service "get" method and passes the result to the review', async () => {
      when(outOfServiceBedService.getOutOfServiceBed)
        .calledWith(request.user.token, premisesId, outOfServiceBed.id)
        .mockResolvedValue(outOfServiceBed)

      const requestHandler = updateOutOfServiceBedController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'v2Manage/outOfServiceBeds/update',
        expect.objectContaining({
          outOfServiceBed,
        }),
      )
    })

    it('formats the start and end dates so they can prepopulate the inputs', async () => {
      const requestHandler = updateOutOfServiceBedController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'v2Manage/outOfServiceBeds/update',
        expect.objectContaining({
          ...DateFormats.isoDateToDateInputs(outOfServiceBed.startDate, 'startDate'),
          ...DateFormats.isoDateToDateInputs(outOfServiceBed.endDate, 'endDate'),
        }),
      )
    })
  })
})

import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import PremisesService from '../../../services/premisesService'
import RoomsController from './roomsController'
import { roomFactory } from '../../../testutils/factories'

describe('RoomsController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const roomsController = new RoomsController(premisesService)

  describe('index', () => {
    it('should return the rooms to the template', async () => {
      const rooms = roomFactory.buildList(1)
      const premisesId = 'premisesId'
      request.params.premisesId = premisesId

      premisesService.getRooms.mockResolvedValue(rooms)

      const requestHandler = roomsController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('premises/rooms/index', {
        rooms,
        premisesId,
        pageHeading: 'Manage rooms',
      })

      expect(premisesService.getRooms).toHaveBeenCalledWith(token, premisesId)
    })
  })

  describe('show', () => {
    it('should return the room to the template', async () => {
      const room = roomFactory.build()
      const premisesId = 'premisesId'
      request.params.premisesId = premisesId
      const roomId = 'roomId'
      request.params.roomId = roomId

      premisesService.getRoom.mockResolvedValue(room)

      const requestHandler = roomsController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('premises/rooms/show', {
        room,
        premisesId,
        pageHeading: 'Manage room',
      })

      expect(premisesService.getRoom).toHaveBeenCalledWith(token, premisesId, roomId)
    })
  })
})

import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import TimelineController from './timelineController'
import PersonService from '../../services/personService'
import { personalTimelineFactory } from '../../testutils/factories'

describe('TimelineController', () => {
  const token = 'SOME_TOKEN'
  const premisesId = 'premisesId'
  const flashSpy = jest.fn()

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const personService = createMock<PersonService>({})

  let timelineController: TimelineController
  let request: Readonly<DeepMocked<Request>>

  beforeEach(() => {
    jest.resetAllMocks()
    timelineController = new TimelineController(personService)
    request = createMock<Request>({
      user: { token },
      flash: flashSpy,
      params: { premisesId },
      headers: {
        referer: 'some-referrer/',
      },
    })
  })

  describe('find', () => {
    it('renders the timeline view', async () => {
      const requestHandler = timelineController.find()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('people/find', { pageHeading: "Find someone's application history" })
    })
  })

  describe('show', () => {
    it('renders the timeline view', async () => {
      const crn = 'CRN'
      const timeline = personalTimelineFactory.build()

      personService.getTimeline.mockResolvedValue(timeline)

      const requestHandler = timelineController.show()

      await requestHandler({ ...request, body: { crn } }, response, next)

      expect(personService.getTimeline).toHaveBeenCalledWith(token, crn)
    })
  })
})

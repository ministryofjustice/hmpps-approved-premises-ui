import { createMock } from '@golevelup/ts-jest'
import { Request, Response } from 'express'
import { when } from 'jest-when'
import { Cancelable, throttle } from 'underscore'
import { FeatureFlagService } from '../services'
import { featureFlagHandler, retrieveFlags, throttleTime } from './setupFeatureFlags'

jest.mock('underscore')

describe('populateFeatureFlags', () => {
  const featureFlagService = createMock<FeatureFlagService>({})

  const request = createMock<Request>()
  const response = createMock<Response>()
  const next = jest.fn()

  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('calls throttle with the flag retrieval function and returns a handler that calls the throttled function', async () => {
    const throttledRetrieveFlags = jest.fn()

    when(throttle)
      .calledWith(expect.any(Function), throttleTime)
      .mockReturnValue(throttledRetrieveFlags as jest.Mock & Cancelable)

    const result = featureFlagHandler(featureFlagService)

    await result(request, response, next)

    expect(throttledRetrieveFlags).toHaveBeenCalledWith(featureFlagService)
    expect(next).toHaveBeenCalled()
  })
})

describe('retrieveFlags', () => {
  const featureFlagService = createMock<FeatureFlagService>({})

  it('calls the service for each flag and adds the result to process.env', async () => {
    when(featureFlagService.getBooleanFlag)
      .calledWith('allow-sufficient-information-request-without-confirmation')
      .mockResolvedValue(true)

    expect(process.env['allow-sufficient-information-request-without-confirmation']).toBeUndefined()

    await retrieveFlags(featureFlagService)

    expect(process.env['allow-sufficient-information-request-without-confirmation']).toBe('true')
  })
})

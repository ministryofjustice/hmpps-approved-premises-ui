import { createMock } from '@golevelup/ts-jest'
import { FliptClient } from '@flipt-io/flipt'
import { when } from 'jest-when'
import { BooleanEvaluationResponse } from '@flipt-io/flipt/dist/evaluation/models'
import config from '../config'
import FeatureFlagService from './featureFlagService'
import logger from '../../logger'

jest.mock('@flipt-io/flipt')
jest.mock('../../logger')

describe('FeatureFlagService', () => {
  let featureFlagService: FeatureFlagService

  describe('when flipt is enabled', () => {
    const mockClient = createMock<FliptClient>({
      evaluation: {
        boolean: jest.fn(),
      },
    })

    beforeEach(() => {
      config.fliptEnabled = true
      config.apis.flipt = {
        namespace: 'some-namespace',
        token: 'some-token',
        url: 'http://localhost',
      }
      ;(FliptClient as jest.Mock).mockReturnValue(mockClient)
      featureFlagService = new FeatureFlagService()
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    describe('getBooleanFlag', () => {
      it.each([true, false])(
        'returns the enabled response from the flipt client when enabled is %s',
        async (enabled: boolean) => {
          const booleanEvaluationResponse = createMock<BooleanEvaluationResponse>({
            enabled,
          })

          when(mockClient.evaluation.boolean)
            .calledWith({
              namespaceKey: featureFlagService.namespaceKey,
              flagKey: 'allow-sufficient-information-request-without-confirmation',
              entityId: '',
              context: {},
            })
            .mockResolvedValue(booleanEvaluationResponse)

          const response = await featureFlagService.getBooleanFlag(
            'allow-sufficient-information-request-without-confirmation',
          )
          expect(response).toEqual(enabled)
        },
      )

      it('returns false and logs an error when the feature flag does not exist', async () => {
        when(mockClient.evaluation.boolean)
          .calledWith({
            namespaceKey: featureFlagService.namespaceKey,
            flagKey: 'allow-sufficient-information-request-without-confirmation',
            entityId: '',
            context: {},
          })
          .mockImplementation(() => {
            throw new Error('Feature flag not found')
          })

        const response = await featureFlagService.getBooleanFlag(
          'allow-sufficient-information-request-without-confirmation',
        )

        expect(response).toEqual(false)
        expect(logger.error).toHaveBeenCalledWith(
          'Feature flag show-search-by-CRN-timeline-navigation not found, defaulting to false',
        )
      })
    })
  })

  describe('when flipt is not enabled', () => {
    beforeEach(() => {
      config.fliptEnabled = false
    })

    it('should return true', async () => {
      const response = await featureFlagService.getBooleanFlag(
        'allow-sufficient-information-request-without-confirmation',
      )
      expect(response).toEqual(true)
    })
  })
})

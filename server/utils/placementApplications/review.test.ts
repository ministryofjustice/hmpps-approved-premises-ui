import type { Request } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { PlacementApplicationReview } from './review'

describe('PlacementApplicationReview', () => {
  const id = 'some-uuid'

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('initialises with expected values', () => {
    const request: DeepMocked<Request> = createMock<Request>({
      params: { id },
      session: {},
    })

    const review = new PlacementApplicationReview(request, 'review')

    expect(review.applicationId).toEqual(id)
    expect(review.body).toEqual({})
    expect(review.step).toEqual('review')
  })

  describe('validate', () => {
    const request: DeepMocked<Request> = createMock<Request>({
      params: { id },
      session: createMock<Request['session']>({
        placementApplicationDecisions: {},
      }),
    })

    describe('review', () => {
      it('records no errors when called with correct review args', () => {
        const body = {
          summaryOfChanges: 'some changes',
        }

        const review = new PlacementApplicationReview(request, 'review')

        review.validate(body)

        expect(review.errors).toEqual({})
      })

      it('records an error when called with missing review body', () => {
        const body = {}

        const review = new PlacementApplicationReview(request, 'review')

        review.validate(body)

        expect(review.errors).toEqual({ summaryOfChanges: 'You must provide a summary of the changes' })
      })
    })

    describe('decision', () => {
      it('records no errors when called with correct decision args', () => {
        const body = { decision: 'accepted' as const, decisionSummary: 'a summary' }

        const review = new PlacementApplicationReview(request, 'decision')

        review.validate(body)

        expect(review.errors).toEqual({})
      })

      it('records an error when called with missing decision body', () => {
        const body = {}

        const review = new PlacementApplicationReview(request, 'decision')

        review.validate(body)

        expect(review.errors).toEqual({
          decision: 'You must provide a decision',
          decisionSummary: 'You must provide a decision summary',
        })
      })
    })
  })

  describe('update', () => {
    it('writes to the request session given valid update inputs', () => {
      const request: DeepMocked<Request> = createMock<Request>({
        params: { id },
        session: createMock<Request['session']>({
          placementApplicationDecisions: { [id]: { summaryOfChanges: 'some changes' } },
        }),
        body: { decision: 'accepted' as const, decisionSummary: 'a summary' },
      })

      const review = new PlacementApplicationReview(request, 'decision')

      review.update()

      expect(request?.session?.placementApplicationDecisions?.[id] || '').toEqual({
        summaryOfChanges: 'some changes',
        decision: 'accepted',
        decisionSummary: 'a summary',
      })
    })

    it('throws an error given invalid update inputs', () => {
      const request: DeepMocked<Request> = createMock<Request>({
        params: { id },
        session: createMock<Request['session']>({
          placementApplicationDecisions: { [id]: { summaryOfChanges: 'some changes' } },
        }),
        body: {},
      })

      const review = new PlacementApplicationReview(request, 'decision')

      expect(() => review.update()).toThrow('Invalid request body')
    })
  })
})

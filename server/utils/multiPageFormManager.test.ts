import { createMock } from '@golevelup/ts-jest'
import { Request } from 'express'
import MultiPageFormManager from './multiPageFormManager'
import { DateFormats } from './dateUtils'

describe('multiPageFormManager', () => {
  let formData: MultiPageFormManager<'transfers'>
  let mockSession: Request['session']

  beforeEach(() => {
    formData = new MultiPageFormManager('transfers')

    mockSession = createMock<Request['session']>({
      multiPageFormData: {
        transfers: {
          'placement-one-id': DateFormats.isoDateToDateInputs('2025-04-30', 'transferDate'),
          'placement-two-id': DateFormats.isoDateToDateInputs('2025-04-22', 'transferDate'),
        },
      },
      save: jest.fn().mockImplementation(callback => (callback ? callback() : undefined)),
    })
  })

  it('returns the session data for the given item', () => {
    expect(formData.get('placement-one-id', mockSession)).toEqual(
      mockSession.multiPageFormData.transfers['placement-one-id'],
    )
    expect(formData.get('placement-two-id', mockSession)).toEqual(
      mockSession.multiPageFormData.transfers['placement-two-id'],
    )
  })

  it('returns undefined if the given item does not exist', () => {
    expect(formData.get('does-not-exist-id', mockSession)).toEqual(undefined)
  })

  it('updates the data provided against the correct id and forces a session save', async () => {
    const updated = await formData.update('placement-one-id', mockSession, { destinationPremisesId: 'testId' })

    expect(updated).toEqual(expect.objectContaining({ destinationPremisesId: 'testId' }))
    expect(mockSession.save).toHaveBeenCalled()
    expect(formData.get('placement-one-id', mockSession)).toEqual(
      expect.objectContaining({ destinationPremisesId: 'testId' }),
    )
  })

  it('removes the data for the provided id only and forces a session save', async () => {
    await formData.remove('placement-one-id', mockSession)

    expect(formData.get('placement-one-id', mockSession)).toEqual(undefined)
    expect(mockSession.save).toHaveBeenCalled()
    expect(formData.get('placement-two-id', mockSession)).toEqual(
      mockSession.multiPageFormData.transfers['placement-two-id'],
    )
  })
})

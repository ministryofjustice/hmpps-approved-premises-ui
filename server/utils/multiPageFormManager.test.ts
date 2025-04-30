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

  it('updates the data provided against the correct id', () => {
    const updated = formData.update('placement-one-id', mockSession, { receivingAPId: 'testId' })

    expect(updated).toEqual(expect.objectContaining({ receivingAPId: 'testId' }))
    expect(formData.get('placement-one-id', mockSession)).toEqual(expect.objectContaining({ receivingAPId: 'testId' }))
  })

  it('removes the data for the provided id', () => {
    formData.remove('placement-one-id', mockSession)

    expect(formData.get('placement-one-id', mockSession)).toEqual(undefined)
  })
})

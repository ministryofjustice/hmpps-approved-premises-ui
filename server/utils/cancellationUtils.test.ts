import { cancellationReasonsRadioItems } from './cancellationUtils'

describe('bookingUtils', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  describe('cancellationReasonRadioItems', () => {
    const objects = [
      {
        id: '123',
        name: 'Other',
      },
      {
        id: '345',
        name: 'foo',
      },
    ]

    it('converts objects to an array of radio items', () => {
      const result = cancellationReasonsRadioItems(objects, 'somehtml', {})

      expect(result).toEqual([
        {
          text: 'Other',
          value: '123',
          checked: false,
          conditional: {
            html: 'somehtml',
          },
        },
        {
          text: 'foo',
          value: '345',
          checked: false,
        },
      ])
    })
  })
})

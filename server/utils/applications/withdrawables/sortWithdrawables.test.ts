import { Withdrawable } from '../../../@types/shared'
import { withdrawableFactory } from '../../../testutils/factories'
import { DateFormats } from '../../dateUtils'
import { sortWithdrawables } from './sortWithdrawables'

describe('sortWithdrawables', () => {
  const { endDate } = withdrawableFactory.build().dates[0]

  it('should sort withdrawables on start date, earliest first', () => {
    const withdrawables = [
      withdrawableFactory.build({
        dates: [{ startDate: '2022-03-01', endDate }],
      }),
      withdrawableFactory.build({
        dates: [{ startDate: '2022-01-01', endDate }],
      }),
      withdrawableFactory.build({
        dates: [{ startDate: '2022-02-01', endDate }],
      }),
    ]
    const expectedWithdrawables = [withdrawables[1], withdrawables[2], withdrawables[0]]

    const sortedWithdrawables = sortWithdrawables(withdrawables)

    expect(sortedWithdrawables).toEqual(expectedWithdrawables)
  })

  it('should handle empty withdrawables array', () => {
    const withdrawables: Array<Withdrawable> = []

    const sortedWithdrawables = sortWithdrawables(withdrawables)

    expect(sortedWithdrawables).toEqual([])
  })

  it('should throw an error if a withdrawable doesnt have dates', () => {
    const withdrawables = [withdrawableFactory.build({ dates: [] }), withdrawableFactory.build({ dates: [] })]

    expect(() => sortWithdrawables(withdrawables)).toThrow(
      `Withdrawable does not have dates. a: ${withdrawables[1].id}, b: ${withdrawables[0].id}`,
    )
  })

  it('should throw an error if isoToDateObj errors', () => {
    jest.spyOn(DateFormats, 'isoToDateObj')
    ;(DateFormats.isoToDateObj as jest.MockedFunction<typeof DateFormats.isoToDateObj>).mockImplementation(() => {
      throw new Error('error')
    })

    const withdrawables = [
      withdrawableFactory.build({ dates: [{ startDate: '2022-03-01', endDate }] }),
      withdrawableFactory.build({ dates: [{ startDate: '2022-01-01', endDate }] }),
      withdrawableFactory.build({ dates: [{ startDate: '2022-02-01', endDate }] }),
    ]

    expect(() => sortWithdrawables(withdrawables)).toThrow(`Error sorting withdrawables:`)
  })
})

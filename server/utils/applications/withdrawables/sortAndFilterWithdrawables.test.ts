import { Withdrawable } from '../../../@types/shared'
import { withdrawableFactory } from '../../../testutils/factories'
import { DateFormats } from '../../dateUtils'
import { sortAndFilterWithdrawables } from './sortAndFilterWithdrawables'

describe('sortAndFilterWithdrawables', () => {
  const { endDate } = withdrawableFactory.build().dates[0]

  it('should only include the specified withdrawable type', () => {
    const applicationWithdrawable = withdrawableFactory.build({ type: 'application' })
    const placementWithdrawable = withdrawableFactory.build({ type: 'booking' })
    const prWithdrawable = withdrawableFactory.build({
      type: 'placement_request',
      dates: [{ startDate: '2022-01-01', endDate }],
    })
    const paWithdrawable = withdrawableFactory.build({
      type: 'placement_application',
      dates: [{ startDate: '2022-01-02', endDate }],
    })
    const withdrawables = [applicationWithdrawable, placementWithdrawable, prWithdrawable, paWithdrawable]

    const sortedWithdrawables = sortAndFilterWithdrawables(withdrawables, [
      'placement_application',
      'placement_request',
    ])

    expect(sortedWithdrawables).toEqual([prWithdrawable, paWithdrawable])
    expect(sortedWithdrawables).not.toContain([applicationWithdrawable, placementWithdrawable])
  })

  it('should sort withdrawables on start date, earliest first', () => {
    const withdrawables = [
      withdrawableFactory.build({
        dates: [{ startDate: '2022-03-01', endDate }],
        type: 'booking',
      }),
      withdrawableFactory.build({
        dates: [{ startDate: '2022-01-01', endDate }],
        type: 'booking',
      }),
      withdrawableFactory.build({
        dates: [{ startDate: '2022-02-01', endDate }],
        type: 'booking',
      }),
    ]
    const expectedWithdrawables = [withdrawables[1], withdrawables[2], withdrawables[0]]

    const sortedWithdrawables = sortAndFilterWithdrawables(withdrawables, ['booking'])

    expect(sortedWithdrawables).toEqual(expectedWithdrawables)
  })

  it('should handle empty withdrawables array', () => {
    const withdrawables: Array<Withdrawable> = []

    const sortedWithdrawables = sortAndFilterWithdrawables(withdrawables, ['booking'])

    expect(sortedWithdrawables).toEqual([])
  })

  it('should throw an error if a withdrawable doesnt have dates', () => {
    const withdrawables = [
      withdrawableFactory.build({ dates: [], type: 'booking' }),
      withdrawableFactory.build({ dates: [], type: 'booking' }),
    ]

    expect(() => sortAndFilterWithdrawables(withdrawables, ['booking'])).toThrow(
      `Withdrawable does not have dates. a: ${withdrawables[1].id}, b: ${withdrawables[0].id}`,
    )
  })

  it('should throw an error if isoToDateObj errors', () => {
    jest.spyOn(DateFormats, 'isoToDateObj')
    ;(DateFormats.isoToDateObj as jest.MockedFunction<typeof DateFormats.isoToDateObj>).mockImplementation(() => {
      throw new Error('error')
    })

    const withdrawables = [
      withdrawableFactory.build({ dates: [{ startDate: '2022-03-01', endDate }], type: 'booking' }),
      withdrawableFactory.build({ dates: [{ startDate: '2022-01-01', endDate }], type: 'booking' }),
      withdrawableFactory.build({ dates: [{ startDate: '2022-02-01', endDate }], type: 'booking' }),
    ]

    expect(() => sortAndFilterWithdrawables(withdrawables, ['booking'])).toThrow(`Error sorting withdrawables:`)
  })
})

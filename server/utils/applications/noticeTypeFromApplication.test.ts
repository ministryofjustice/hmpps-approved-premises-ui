import { add } from 'date-fns'

import { DateFormats } from '../dateUtils'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'
import { noticeTypeFromApplication } from './noticeTypeFromApplication'

import applicationFactory from '../../testutils/factories/application'

jest.mock('./arrivalDateFromApplication')

describe('noticeTypeFromApplication', () => {
  const application = applicationFactory.build({})

  it('returns emergency if the arrival date is less than seven days away', () => {
    const date = add(new Date(), { days: 4 })
    const arrivalDate = DateFormats.dateObjToIsoDate(date)

    ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(arrivalDate)

    expect(noticeTypeFromApplication(application)).toEqual('emergency')
  })

  it('returns short_notice if the arrival date is less than 4 months away', () => {
    const date = add(new Date(), { months: 3 })
    const arrivalDate = DateFormats.dateObjToIsoDate(date)

    ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(arrivalDate)

    expect(noticeTypeFromApplication(application)).toEqual('short_notice')
  })

  it('returns standard if the arrival date is more than 4 months away', () => {
    const date = add(new Date(), { months: 6 })
    const arrivalDate = DateFormats.dateObjToIsoDate(date)

    ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(arrivalDate)

    expect(noticeTypeFromApplication(application)).toEqual('standard')
  })
})

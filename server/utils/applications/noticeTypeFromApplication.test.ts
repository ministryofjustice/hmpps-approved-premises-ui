import { add } from 'date-fns'

import { faker } from '@faker-js/faker'
import { DateFormats } from '../dateUtils'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'
import { noticeTypeFromApplication } from './noticeTypeFromApplication'

import { applicationFactory } from '../../testutils/factories'

jest.mock('./arrivalDateFromApplication')

describe.each([
  ['submited application', faker.date.recent({ days: 20 })],
  ['non-submitted application', undefined],
])('noticeTypeFromApplication (%s)', (_, submittedDate) => {
  const application = applicationFactory.build({
    submittedAt: submittedDate ? DateFormats.dateObjToIsoDate(submittedDate) : undefined,
  })
  const referenceDate = submittedDate || new Date()

  it('returns emergency if the arrival date is less than 8 days away', () => {
    const date = add(referenceDate, { days: 4 })
    const arrivalDate = DateFormats.dateObjToIsoDate(date)

    ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(arrivalDate)

    expect(noticeTypeFromApplication(application)).toEqual('emergency')
  })

  it('returns shortNotice if the arrival date is less than 29 days away', () => {
    const date = add(referenceDate, { days: 22 })
    const arrivalDate = DateFormats.dateObjToIsoDate(date)

    ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(arrivalDate)

    expect(noticeTypeFromApplication(application)).toEqual('shortNotice')
  })

  it('returns standard if the arrival date is more than 28 days away', () => {
    const date = add(referenceDate, { weeks: 6 })
    const arrivalDate = DateFormats.dateObjToIsoDate(date)

    ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(arrivalDate)

    expect(noticeTypeFromApplication(application)).toEqual('standard')
  })

  it('returns standard if there is not an arrival date for the application', () => {
    ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(null)

    expect(noticeTypeFromApplication(application)).toEqual('standard')
  })
})

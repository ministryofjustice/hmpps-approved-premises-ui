import { addDays, formatISO } from 'date-fns'
import { assessmentSummaryFactory } from '../../testutils/factories'
import { daysUntilDue } from './dateUtils'
import { DateFormats, addBusinessDays } from '../dateUtils'

jest.mock('../dateUtils')

describe('daysUntilDue', () => {
  it('calls the functions it contains with the correct arguments and returns the result of differenceInBusinessDays', () => {
    const newDate = new Date()
    const receivedDate = new Date()
    const dueDate = addDays(receivedDate, 10)
    ;(DateFormats.isoToDateObj as jest.MockedFunction<typeof DateFormats.isoToDateObj>).mockReturnValue(receivedDate)
    ;(DateFormats.dateObjToIsoDate as jest.MockedFunction<typeof DateFormats.dateObjToIsoDate>).mockImplementation(
      date => formatISO(date, { representation: 'date' }),
    )
    ;(
      DateFormats.dateObjToIsoDateTime as jest.MockedFunction<typeof DateFormats.dateObjToIsoDateTime>
    ).mockImplementation(date => formatISO(date, { representation: 'time' }))
    ;(
      DateFormats.differenceInBusinessDays as jest.MockedFunction<typeof DateFormats.differenceInBusinessDays>
    ).mockReturnValue(1)
    ;(addBusinessDays as jest.MockedFunction<typeof addBusinessDays>).mockReturnValue(addDays(receivedDate, 10))

    const assessment = assessmentSummaryFactory.build({
      createdAt: formatISO(receivedDate, { representation: 'date' }),
    })

    expect(daysUntilDue(assessment, newDate)).toEqual(1)

    expect(DateFormats.isoToDateObj).toHaveBeenCalledWith(assessment.createdAt)
    expect(addBusinessDays).toHaveBeenCalledWith(receivedDate, 10)
    expect(DateFormats.differenceInBusinessDays).toHaveBeenCalledWith(dueDate, newDate)
  })
})

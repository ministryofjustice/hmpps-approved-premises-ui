import { when } from 'jest-when'
import { applicationFactory } from '../../testutils/factories'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import { startDateOutsideOfNationalStandardsTimescales } from './startDateOutsideOfNationalStandardsTimescales'
import { reasonForShortNoticeDetails } from './reasonForShortNoticeDetails'
import ReasonForShortNotice from '../../form-pages/apply/reasons-for-placement/basic-information/reasonForShortNotice'

jest.mock('../retrieveQuestionResponseFromFormArtifact')
jest.mock('../applications/applicantAndCaseManagerDetails')
jest.mock('./arrivalDateFromApplication')
jest.mock('./utils')
jest.mock('./startDateOutsideOfNationalStandardsTimescales')

jest.mock('../retrieveQuestionResponseFromFormArtifact')

describe('reasonFosShortNoticeDetails', () => {
  it('returns reason for short notice details if startDate outside of NationalStandardsTimescales ', () => {
    const application = applicationFactory.build()

    when(startDateOutsideOfNationalStandardsTimescales).calledWith(application).mockReturnValue(true)

    when(retrieveOptionalQuestionResponseFromFormArtifact)
      .calledWith(application, ReasonForShortNotice, 'reason')
      .mockReturnValue('reason')
    when(retrieveOptionalQuestionResponseFromFormArtifact)
      .calledWith(application, ReasonForShortNotice, 'other')
      .mockReturnValue('other')

    const { reasonForShortNotice, reasonForShortNoticeOther } = reasonForShortNoticeDetails(application)

    expect(reasonForShortNotice).toEqual('reason')
    expect(reasonForShortNoticeOther).toEqual('other')
  })

  it('returns reason for short notice details if startDate is in range of NationalStandardsTimescales ', () => {
    const application = applicationFactory.build()

    when(startDateOutsideOfNationalStandardsTimescales).calledWith(application).mockReturnValue(false)

    when(retrieveOptionalQuestionResponseFromFormArtifact)
      .calledWith(application, ReasonForShortNotice, 'reason')
      .mockReturnValue('reason')
    when(retrieveOptionalQuestionResponseFromFormArtifact)
      .calledWith(application, ReasonForShortNotice, 'other')
      .mockReturnValue('other')

    const { reasonForShortNotice, reasonForShortNoticeOther } = reasonForShortNoticeDetails(application)

    expect(reasonForShortNotice).toEqual(undefined)
    expect(reasonForShortNoticeOther).toEqual(undefined)
  })
})

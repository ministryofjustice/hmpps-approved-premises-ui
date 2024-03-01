import { when } from 'jest-when'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import { applicationFactory } from '../../testutils/factories'
import ConfirmYourDetails from '../../form-pages/apply/reasons-for-placement/basic-information/confirmYourDetails'
import CaseManagerInformation, {
  caseManagerKeys,
} from '../../form-pages/apply/reasons-for-placement/basic-information/caseManagerInformation'
import { userDetailsFromCaseManagerPage, userDetailsFromConfirmYourDetailsPage } from './userDetailsFromApplication'
import { applicationUserDetailsFactory } from '../../testutils/factories/application'

jest.mock('../retrieveQuestionResponseFromFormArtifact')

describe('userDetailsFromApplication', () => {
  const application = applicationFactory.build()
  const user = applicationUserDetailsFactory.build()

  const details = [
    { fieldName: 'name', value: user.name },
    { fieldName: 'emailAddress', value: user.email },
    { fieldName: 'phoneNumber', value: user.telephoneNumber },
  ]
  beforeEach(() => {
    jest.clearAllMocks()
  })
  describe('userDetailsFromConfirmYourDetailsPage', () => {
    describe('if details were entered into the fields on the page', () => {
      it('returns the details entered in the ConfirmYourDetails page', () => {
        when(retrieveOptionalQuestionResponseFromFormArtifact)
          .calledWith(application, ConfirmYourDetails, 'detailsToUpdate')
          .mockReturnValue(['name', 'emailAddress', 'phoneNumber'])

        details.forEach(({ fieldName, value }) => {
          when(retrieveOptionalQuestionResponseFromFormArtifact)
            .calledWith(application, ConfirmYourDetails, fieldName)
            .mockReturnValue(value)
        })

        expect(userDetailsFromConfirmYourDetailsPage(application)).toEqual({
          email: user.email,
          name: user.name,
          telephoneNumber: user.telephoneNumber,
        })
        expect(retrieveOptionalQuestionResponseFromFormArtifact).toHaveBeenNthCalledWith(
          1,
          application,
          ConfirmYourDetails,
          'userDetailsFromDelius',
        )
        expect(retrieveOptionalQuestionResponseFromFormArtifact).toHaveBeenNthCalledWith(
          2,
          application,
          ConfirmYourDetails,
          'detailsToUpdate',
        )
        caseManagerKeys.forEach((fieldName, i) => {
          expect(retrieveOptionalQuestionResponseFromFormArtifact).toHaveBeenNthCalledWith(
            i + 3,
            application,
            ConfirmYourDetails,
            fieldName,
          )
        })
      })
    })

    describe('if the user details werent changed', () => {
      it('returns the details shown on the ConfirmYourDetails page', () => {
        const userDetails = applicationUserDetailsFactory.build()
        const userDetailsFromDelius = {
          name: userDetails.name,
          emailAddress: userDetails.email,
          phoneNumber: userDetails.telephoneNumber,
        }

        details.forEach(({ fieldName }) => {
          when(retrieveOptionalQuestionResponseFromFormArtifact)
            .calledWith(application, ConfirmYourDetails, fieldName)
            .mockReturnValue(undefined)
        })
        when(retrieveOptionalQuestionResponseFromFormArtifact)
          .calledWith(application, ConfirmYourDetails, 'userDetailsFromDelius')
          .mockReturnValue(userDetailsFromDelius)

        expect(userDetailsFromConfirmYourDetailsPage(application)).toEqual(userDetails)
        expect(retrieveOptionalQuestionResponseFromFormArtifact).toHaveBeenNthCalledWith(
          1,
          application,
          ConfirmYourDetails,
          'userDetailsFromDelius',
        )
        expect(retrieveOptionalQuestionResponseFromFormArtifact).toHaveBeenNthCalledWith(
          2,
          application,
          ConfirmYourDetails,
          'detailsToUpdate',
        )
        caseManagerKeys.forEach((fieldName, i) => {
          expect(retrieveOptionalQuestionResponseFromFormArtifact).toHaveBeenNthCalledWith(
            i + 3,
            application,
            ConfirmYourDetails,
            fieldName,
          )
        })
      })
    })
  })

  describe('userDetailsFromCaseManagerPage', () => {
    it('returns the details entered in the CaseManagerInformationPage page', () => {
      details.forEach(({ fieldName, value }) => {
        when(retrieveOptionalQuestionResponseFromFormArtifact)
          .calledWith(application, CaseManagerInformation, fieldName)
          .mockReturnValue(value)
      })

      expect(userDetailsFromCaseManagerPage(application)).toEqual({
        name: user.name,
        email: user.email,
        telephoneNumber: user.telephoneNumber,
      })

      caseManagerKeys.forEach((fieldName, i) => {
        expect(retrieveOptionalQuestionResponseFromFormArtifact).toHaveBeenNthCalledWith(
          i + 1,
          application,
          CaseManagerInformation,
          fieldName,
        )
      })
      expect(retrieveOptionalQuestionResponseFromFormArtifact).toHaveBeenCalledTimes(details.length)
    })
  })
})

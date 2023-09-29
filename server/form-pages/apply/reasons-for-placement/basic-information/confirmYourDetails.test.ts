import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { ApprovedPremisesApplication as Application, FullPerson } from '../../../../@types/shared'
import { UserService } from '../../../../services'
import { applicationFactory } from '../../../../testutils/factories'
import { RestrictedPersonError } from '../../../../utils/errors'
import { isApplicableTier, isFullPerson } from '../../../../utils/personUtils'
import { lowerCase } from '../../../../utils/utils'
import ConfirmYourDetails, { Body, updatableDetails } from './confirmYourDetails'

jest.mock('../../../../utils/personUtils')

describe('ConfirmYourDetails', () => {
  const application: Readonly<Application> = applicationFactory.build()

  const body: Body = {
    detailsToUpdate: ['name', 'emailAddress', 'phoneNumber'],
    name: 'Bob',
    emailAddress: 'bob@test.com',
    phoneNumber: '0123456789',
    caseManagementResponsibility: 'yes',
    userDetailsFromDelius: {
      name: 'Acting user from delius name',
      emailAddress: 'Acting user from delius email address',
      phoneNumber: 'Acting user from delius phone number',
    },
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new ConfirmYourDetails(body, application)

      expect(page.body).toEqual(body)
    })
  })

  describe('initialize', () => {
    it('calls the userService.getUserById method and returns an instantiated ConfirmYourDetails page', async () => {
      const actingUserFromDelius = {
        name: body.name,
        email: body.emailAddress,
        telephoneNumber: body.phoneNumber,
      }

      const deliusUserMappedForUi = {
        name: actingUserFromDelius.name,
        emailAddress: actingUserFromDelius.email,
        phoneNumber: actingUserFromDelius.telephoneNumber,
      }

      const getUserByIdMock = jest.fn().mockResolvedValue(actingUserFromDelius)

      const userService: DeepMocked<UserService> = createMock<UserService>({
        getUserById: getUserByIdMock,
      })

      const result = await ConfirmYourDetails.initialize({}, application, 'token', { userService })
      const expected = new ConfirmYourDetails(
        {
          userDetailsFromDelius: deliusUserMappedForUi,
        },
        application,
      )
      expected.userDetailsFromDelius = {
        name: actingUserFromDelius.name,
        emailAddress: actingUserFromDelius.email,
        phoneNumber: actingUserFromDelius.telephoneNumber,
      }

      expect(getUserByIdMock).toHaveBeenCalledWith('token', application.createdByUserId)

      expect(result).toEqual(expected)
      expect(result.userDetailsFromDelius).toEqual(deliusUserMappedForUi)
    })
  })

  describe('next', () => {
    it('returns "transgender" if caseManagementResponsibility is "yes', () => {
      expect(new ConfirmYourDetails({ ...body, caseManagementResponsibility: 'yes' }, application).next()).toBe(
        'transgender',
      )
    })

    it('returns "case-manager-information" if caseManagementResponsibility is "no', () => {
      expect(new ConfirmYourDetails({ ...body, caseManagementResponsibility: 'no' }, application).next()).toBe(
        'case-manager-information',
      )
    })
  })

  describe('previous', () => {
    describe('if the PiP is a restricted person', () => {
      it('throws a restricted person error', () => {
        ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(false)

        const page = new ConfirmYourDetails({}, application)

        expect(() => page.previous()).toThrowError(RestrictedPersonError)
        expect(isApplicableTier).not.toHaveBeenCalled()
      })
    })

    describe('if the PiP is a full person', () => {
      it('returns "dashboard" if the person is the applicable tier', () => {
        ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)
        ;(isApplicableTier as jest.MockedFunction<typeof isApplicableTier>).mockReturnValue(true)

        expect(new ConfirmYourDetails(body, application).previous()).toBe('dashboard')
        expect(isApplicableTier).toHaveBeenCalledWith(
          (application.person as FullPerson).sex,
          application.risks?.tier?.value?.level,
        )
      })

      it('returns "exception-details" if the person is not in the applicable tier', () => {
        ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)
        ;(isApplicableTier as jest.MockedFunction<typeof isApplicableTier>).mockReturnValue(true)

        expect(new ConfirmYourDetails(body, application).previous()).toBe('dashboard')
        expect(isApplicableTier).toHaveBeenCalledWith(
          (application.person as FullPerson).sex,
          application.risks?.tier?.value?.level,
        )
      })
    })
  })

  describe('errors', () => {
    it('should return an empty object if all the fields are populated', () => {
      const page = new ConfirmYourDetails(body, application)
      expect(page.errors()).toEqual({})
    })

    describe.each(updatableDetails)('when %s is in the detailsToUpdate array but the field is not populated', field => {
      const bodyWithoutField: Readonly<Partial<Body>> = { ...body, detailsToUpdate: [field], [field]: undefined }
      const page = new ConfirmYourDetails(bodyWithoutField, application)

      it('should return an error', () => {
        expect(page.errors()).toEqual({
          [field]: `You must enter your updated ${lowerCase(field)}`,
        })
      })
    })

    it('should return an error if there is no response for caseManagementResponsibility', () => {
      const page = new ConfirmYourDetails({ ...body, caseManagementResponsibility: undefined }, application)

      expect(page.errors()).toEqual({
        caseManagementResponsibility: 'You must enter whether you have case management responsibility',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response when all fields are present', () => {
      const page = new ConfirmYourDetails(body, application)

      expect(page.response()).toEqual({
        [page.questions.updateDetails.label]: ['Name', 'Email address', 'Phone number'].join(', '),
        'Applicant name': 'Bob',
        'Applicant email address': 'bob@test.com',
        'Applicant phone number': '0123456789',
        'Do you have case management responsibility?': 'Yes',
      })
    })

    it('should return a translated version of the response when one of the fields is update but the others are retained', () => {
      const page = new ConfirmYourDetails({ ...body, detailsToUpdate: ['emailAddress'] }, application)

      expect(page.response()).toEqual({
        [page.questions.updateDetails.label]: 'Email address',
        'Applicant email address': 'bob@test.com',
        'Do you have case management responsibility?': 'Yes',
        'Applicant name': body.userDetailsFromDelius.name,
        'Applicant phone number': body.userDetailsFromDelius.phoneNumber,
      })
    })

    it('should return a translated version of the response, pulling through the user details from Delius, when only the required fields are present', () => {
      const page = new ConfirmYourDetails({ ...body, detailsToUpdate: [] }, application)

      expect(page.response()).toEqual({
        [page.questions.updateDetails.label]: 'None',
        'Applicant name': body.userDetailsFromDelius.name,
        'Applicant email address': body.userDetailsFromDelius.emailAddress,
        'Applicant phone number': body.userDetailsFromDelius.phoneNumber,
        'Do you have case management responsibility?': 'Yes',
      })
    })
  })
})

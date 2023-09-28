import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { ApprovedPremisesApplication as Application } from '../../../../@types/shared'
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
    'detailsToUpdate[]': ['name', 'emailAddress', 'phoneNumber'],
    name: 'Bob',
    emailAddress: 'bob@test.com',
    phoneNumber: '0123456789',
    caseManagementResponsibility: 'yes',
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
      const actingUser = {
        name: body.name,
        emailAddress: body.emailAddress,
        phoneNumber: body.phoneNumber,
      }
      const getUserByIdMock = jest.fn().mockResolvedValue(actingUser)

      const userService: DeepMocked<UserService> = createMock<UserService>({
        getUserById: getUserByIdMock,
      })

      const result = await ConfirmYourDetails.initialize(body, application, 'token', { userService })

      expect(getUserByIdMock).toHaveBeenCalledWith('token', application.createdByUserId)

      expect(result).toEqual({
        ...new ConfirmYourDetails(body, application),
        userDetailsFromDelius: actingUser,
      })
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
      })
    })

    describe('if the PiP is a full person', () => {
      it('returns "dashboard" if the person is the applicable tier', () => {
        ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)
        ;(isApplicableTier as jest.MockedFunction<typeof isApplicableTier>).mockReturnValue(true)

        expect(new ConfirmYourDetails(body, application).previous()).toBe('dashboard')
      })

      it('returns "exception-details" if the person is not in the applicable tier', () => {
        ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)
        ;(isApplicableTier as jest.MockedFunction<typeof isApplicableTier>).mockReturnValue(true)

        expect(new ConfirmYourDetails(body, application).previous()).toBe('dashboard')
      })
    })
  })

  describe('errors', () => {
    it('should return an empty object if all the fields are populated', () => {
      const page = new ConfirmYourDetails(body, application)
      expect(page.errors()).toEqual({})
    })

    describe.each(updatableDetails)('when %s is in the detailsToUpdate array but the field is not populated', field => {
      const bodyWithoutField: Readonly<Partial<Body>> = { ...body, 'detailsToUpdate[]': [field], [field]: undefined }
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
    it('should return a translated version of the response', () => {
      const page = new ConfirmYourDetails(body, application)

      expect(page.response()).toEqual({
        [page.questions.updateDetails.label]: ['Name', 'Email address', 'Phone number'].join(', '),
        'Applicant name': 'Bob',
        'Applicant email address': 'bob@test.com',
        'Applicant phone number': '0123456789',
        'Do you have case management responsibility?': 'Yes',
      })
    })
  })
})

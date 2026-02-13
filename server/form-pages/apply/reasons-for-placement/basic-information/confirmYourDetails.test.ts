import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { fromPartial } from '@total-typescript/shoehorn'
import { ApprovedPremisesApplication as Application, FullPerson } from '../../../../@types/shared'
import { ApAreaService, UserService } from '../../../../services'
import { apAreaFactory, applicationFactory } from '../../../../testutils/factories'
import { RestrictedPersonError } from '../../../../utils/errors'
import { isApplicableTier, isFullPerson } from '../../../../utils/personUtils'
import { lowerCase } from '../../../../utils/utils'
import ConfirmYourDetails, { Body, userDetailsKeys } from './confirmYourDetails'

jest.mock('../../../../utils/personUtils')

describe('ConfirmYourDetails', () => {
  const application: Readonly<Application> = applicationFactory.build()
  const areas = apAreaFactory.buildList(2)
  const area = areas[0]

  const body: Body = {
    detailsToUpdate: ['name', 'emailAddress', 'phoneNumber', 'area'],
    name: 'Bob',
    emailAddress: 'bob@test.gov.uk',
    phoneNumber: '0123456789',
    caseManagementResponsibility: 'yes',
    area: area.id,
    areas,
    userDetailsFromDelius: {
      name: 'Acting user from delius name',
      emailAddress: 'Acting user from delius email address',
      phoneNumber: 'Acting user from delius phone number',
      area,
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

    describe('if the "area" isnt present in the "body" it should use the one from Delius', () => {
      const areaFromDelius = apAreaFactory.build()
      const page = new ConfirmYourDetails(
        {
          ...body,
          area: undefined,
          detailsToUpdate: [],
          userDetailsFromDelius: {
            ...body.userDetailsFromDelius,
            area: areaFromDelius,
          },
        },
        application,
      )

      expect(page.body.area).toEqual(areaFromDelius.id)
    })

    it('should set the body with the area from the body if it is present', () => {
      const page = new ConfirmYourDetails({ ...body, area: 'area' }, application)

      expect(page.body).toEqual({ ...body, area: 'area' })
    })
  })

  describe('initialize', () => {
    const actingUserFromDelius = {
      name: body.name,
      email: body.emailAddress,
      telephoneNumber: body.phoneNumber,
      apArea: area,
    }

    const deliusUserMappedForUi = {
      name: actingUserFromDelius.name,
      emailAddress: actingUserFromDelius.email,
      phoneNumber: actingUserFromDelius.telephoneNumber,
      area: actingUserFromDelius.apArea,
    }

    let getUserByIdMock: jest.Mock
    let userService: DeepMocked<UserService>

    beforeEach(() => {
      getUserByIdMock = jest.fn().mockResolvedValue(actingUserFromDelius)
      userService = createMock<UserService>({
        getUserById: getUserByIdMock,
      })
    })

    it('calls the data services and returns an instantiated ConfirmYourDetails page', async () => {
      const getAreasMock = jest.fn().mockResolvedValue(areas)
      const apAreaService: DeepMocked<ApAreaService> = createMock<ApAreaService>({
        getApAreas: getAreasMock,
      })

      const result = await ConfirmYourDetails.initialize(
        {},
        application,
        'token',
        fromPartial({ userService, apAreaService }),
      )
      const expected = new ConfirmYourDetails(
        {
          userDetailsFromDelius: deliusUserMappedForUi,
          areas,
        },
        application,
      )

      expected.userDetailsFromDelius = {
        name: actingUserFromDelius.name,
        emailAddress: actingUserFromDelius.email,
        phoneNumber: actingUserFromDelius.telephoneNumber,
        area: actingUserFromDelius.apArea,
      }

      expect(getUserByIdMock).toHaveBeenCalledWith('token', application.createdByUserId)
      expect(getAreasMock).toHaveBeenCalledWith('token')
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

    describe.each(userDetailsKeys)('when %s is in the detailsToUpdate array but the field is not populated', field => {
      const bodyWithoutField: Readonly<Partial<Body>> = { ...body, detailsToUpdate: [field], [field]: undefined }
      const page = new ConfirmYourDetails(bodyWithoutField, application)

      it('should return an error', () => {
        expect(page.errors()).toEqual({
          [field]: `You must enter your updated ${lowerCase(field)}`,
        })
      })
    })

    it.each([
      ['area', 'AP area'],
      ['name', 'name'],
      ['emailAddress', 'email address'],
      ['phoneNumber', 'phone number'],
    ])(
      `should return an error if there is no %s in Delius and one is not entered in the form`,
      (fieldName, errorCopy) => {
        const page = new ConfirmYourDetails(
          {
            ...body,
            [fieldName]: '',
            detailsToUpdate: [],
            userDetailsFromDelius: {
              ...body.userDetailsFromDelius,
              [fieldName]: undefined,
            },
          },
          application,
        )

        expect(page.errors()).toEqual({
          [fieldName]: `You must enter your ${errorCopy}`,
        })
      },
    )

    it('should return an error if there is no response for caseManagementResponsibility', () => {
      const page = new ConfirmYourDetails({ ...body, caseManagementResponsibility: undefined }, application)

      expect(page.errors()).toEqual({
        caseManagementResponsibility: 'You must enter whether you have case management responsibility',
      })
    })

    it('should return an error if the email address is not a .gov.uk email address', () => {
      const page = new ConfirmYourDetails(
        { ...body, emailAddress: 'name@example.com', detailsToUpdate: ['emailAddress'] },
        application,
      )

      expect(page.errors()).toEqual({
        emailAddress: 'Enter an email address ending .gov.uk',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response when all fields are present', () => {
      const page = new ConfirmYourDetails(body, application)

      expect(page.response()).toEqual({
        [page.questions.updateDetails.label]: ['Name', 'Email address', 'Phone number', 'Area'].join(', '),
        'Applicant name': 'Bob',
        'Applicant email address': 'bob@test.gov.uk',
        'Applicant phone number': '0123456789',
        'Applicant AP area': area.name,
        'Do you have case management responsibility?': 'Yes',
      })
    })

    it('should return a translated version of the response when one of the fields is updated but the others are retained', () => {
      const page = new ConfirmYourDetails({ ...body, detailsToUpdate: ['emailAddress'] }, application)

      expect(page.response()).toEqual({
        [page.questions.updateDetails.label]: 'Email address',
        'Applicant email address': 'bob@test.gov.uk',
        'Do you have case management responsibility?': 'Yes',
        'Applicant name': body.userDetailsFromDelius.name,
        'Applicant phone number': body.userDetailsFromDelius.phoneNumber,
        'Applicant AP area': area.name,
      })
    })

    it('should return a translated version of the response, pulling through the user details from Delius, when only the required fields are present', () => {
      const page = new ConfirmYourDetails({ ...body, detailsToUpdate: [] }, application)

      expect(page.response()).toEqual({
        [page.questions.updateDetails.label]: 'None',
        'Applicant name': body.userDetailsFromDelius.name,
        'Applicant email address': body.userDetailsFromDelius.emailAddress,
        'Applicant phone number': body.userDetailsFromDelius.phoneNumber,
        'Applicant AP area': body.userDetailsFromDelius.area.name,
        'Do you have case management responsibility?': 'Yes',
      })
    })

    it('should return an empty field if the field name is not in the detailsToUpdate[] and it is not present in Delius', () => {
      const page = new ConfirmYourDetails(
        {
          ...body,
          detailsToUpdate: [],
          userDetailsFromDelius: {
            ...body.userDetailsFromDelius,
            phoneNumber: undefined,
            emailAddress: undefined,
            area: undefined,
          },
        },
        application,
      )

      expect(page.response()).toEqual({
        [page.questions.updateDetails.label]: 'None',
        'Applicant name': body.userDetailsFromDelius.name,
        'Applicant email address': '',
        'Applicant phone number': '',
        'Applicant AP area': '',
        'Do you have case management responsibility?': 'Yes',
      })
    })
  })
})

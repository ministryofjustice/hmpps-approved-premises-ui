import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { fromPartial } from '@total-typescript/shoehorn'
import { OasysNotFoundError } from '../../../../services/personService'
import { ApplicationService, PersonService } from '../../../../services'
import { applicationFactory, cas1OASysSupportingInformationMetaDataFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import OptionalOasysSections from './optionalOasysSections'

jest.mock('../../../../services/personService.ts')

describe('OptionalOasysSections', () => {
  const oasysSelection = cas1OASysSupportingInformationMetaDataFactory.needsNotLinkedToReoffending().buildList(3)
  const needsLinkedToHarm = cas1OASysSupportingInformationMetaDataFactory.needsLinkedToHarm().buildList(2)

  const application = applicationFactory.build()

  describe('initialize', () => {
    const getOasysSelectionsMock = jest.fn().mockResolvedValue(oasysSelection)
    let personService: DeepMocked<PersonService>
    const applicationService = createMock<ApplicationService>({})

    const needsLinkedToReoffending = [
      cas1OASysSupportingInformationMetaDataFactory.needsLinkedToReoffending().build({ section: 1 }),
      cas1OASysSupportingInformationMetaDataFactory.needsLinkedToReoffending().build({ section: 2 }),
      cas1OASysSupportingInformationMetaDataFactory.needsLinkedToReoffending().build({ section: 3 }),
    ]

    const otherNeeds = [
      cas1OASysSupportingInformationMetaDataFactory.needsNotLinkedToReoffending().build({ section: 7 }),
      cas1OASysSupportingInformationMetaDataFactory.needsNotLinkedToReoffending().build({ section: 8 }),
      cas1OASysSupportingInformationMetaDataFactory.needsNotLinkedToReoffending().build({ section: 9 }),
    ]

    beforeEach(() => {
      personService = createMock<PersonService>({
        getOasysMetadata: getOasysSelectionsMock,
      })

      getOasysSelectionsMock.mockResolvedValue([...needsLinkedToHarm, ...needsLinkedToReoffending, ...otherNeeds])
    })

    it('calls the getOasysSelections method on the client with a token and the persons CRN', async () => {
      await OptionalOasysSections.initialize(
        {},
        application,
        'some-token',
        fromPartial({ personService, applicationService }),
      )

      expect(getOasysSelectionsMock).toHaveBeenCalledWith('some-token', application.person.crn)
    })

    it('filters the OASys sections into needs linked to reoffending and other needs not linked to reoffending or harm', async () => {
      const page = await OptionalOasysSections.initialize(
        {},
        application,
        'some-token',
        fromPartial({
          personService,
          applicationService,
        }),
      )

      expect(page.allNeedsLinkedToReoffending).toEqual(needsLinkedToReoffending)
      expect(page.allOtherNeeds).toEqual(otherNeeds)
    })

    it('returns an empty array for the selected needs if the body is empty', async () => {
      const page = await OptionalOasysSections.initialize(
        {},
        application,
        'some-token',
        fromPartial({
          personService,
          applicationService,
        }),
      )

      expect(page.body.needsLinkedToReoffending).toEqual([])
      expect(page.body.otherNeeds).toEqual([])
    })

    it('initializes the OptionalOasysSections class with the selected sections when sections are a string', async () => {
      const page = await OptionalOasysSections.initialize(
        {
          needsLinkedToReoffending: needsLinkedToReoffending[0].section.toString(),
          otherNeeds: [otherNeeds[0].section.toString(), otherNeeds[1].section.toString()],
        },
        application,
        'some-token',
        fromPartial({
          personService,
          applicationService,
        }),
      )

      expect(page.body.needsLinkedToReoffending).toEqual([needsLinkedToReoffending[0]])
      expect(page.body.otherNeeds).toEqual([otherNeeds[0], otherNeeds[1]])
    })

    it('initializes the OptionalOasysSections class with the selected sections when sections are section objects', async () => {
      const page = await OptionalOasysSections.initialize(
        { needsLinkedToReoffending: [needsLinkedToReoffending[0]], otherNeeds: [otherNeeds[0], otherNeeds[1]] },
        application,
        'some-token',
        fromPartial({
          personService,
          applicationService,
        }),
      )

      expect(page.body.needsLinkedToReoffending).toEqual([needsLinkedToReoffending[0]])
      expect(page.body.otherNeeds).toEqual([otherNeeds[0], otherNeeds[1]])
    })

    it(`Don't error if an oasys section is null (APS-1772)`, async () => {
      getOasysSelectionsMock.mockResolvedValue([...needsLinkedToHarm, null, ...needsLinkedToReoffending, ...otherNeeds])

      const page = await OptionalOasysSections.initialize(
        { needsLinkedToReoffending: [needsLinkedToReoffending[0]], otherNeeds: [otherNeeds[0], otherNeeds[1]] },
        application,
        'some-token',
        fromPartial({
          personService,
          applicationService,
        }),
      )
      expect(page.body.needsLinkedToReoffending).toEqual([needsLinkedToReoffending[0]])
      expect(page.body.otherNeeds).toEqual([otherNeeds[0], otherNeeds[1]])
    })

    it('sets oasysSuccess to false if an OasysNotFoundError is thrown', async () => {
      getOasysSelectionsMock.mockImplementation(() => {
        throw new OasysNotFoundError('')
      })

      const page = await OptionalOasysSections.initialize(
        {},
        application,
        'some-token',
        fromPartial({
          personService,
          applicationService,
        }),
      )

      expect(page.oasysSuccess).toEqual(false)
      expect(page.body.needsLinkedToReoffending).toEqual([])
      expect(page.body.otherNeeds).toEqual([])
    })
  })

  itShouldHaveNextValue(new OptionalOasysSections({}), 'rosh-summary')

  itShouldHavePreviousValue(new OptionalOasysSections({}), 'dashboard')

  describe('errors', () => {
    it('should return an empty object', () => {
      const page = new OptionalOasysSections({})
      expect(page.errors()).toEqual({})
    })
  })

  describe('response', () => {
    const needLinkedToReoffendingA = cas1OASysSupportingInformationMetaDataFactory
      .needsLinkedToReoffending()
      .build({ section: 1, sectionLabel: 'Some section' })
    const needLinkedToReoffendingB = cas1OASysSupportingInformationMetaDataFactory
      .needsLinkedToReoffending()
      .build({ section: 2, sectionLabel: 'Some other Section' })
    const otherNeedA = cas1OASysSupportingInformationMetaDataFactory
      .needsNotLinkedToReoffending()
      .build({ section: 3, sectionLabel: 'Foo Section' })
    const otherNeedB = cas1OASysSupportingInformationMetaDataFactory
      .needsNotLinkedToReoffending()
      .build({ section: 4, sectionLabel: 'Bar Section' })

    describe('should return a translated version of the OASys sections', () => {
      it('when every need is selected', () => {
        const page = new OptionalOasysSections({
          needsLinkedToReoffending: [needLinkedToReoffendingA, needLinkedToReoffendingB],
          otherNeeds: [otherNeedA, otherNeedB],
        })

        page.allNeedsLinkedToReoffending = [needLinkedToReoffendingA, needLinkedToReoffendingB]

        page.allOtherNeeds = [otherNeedA, otherNeedB]

        expect(page.response()).toEqual({
          [page.needsLinkedToReoffendingHeading]: '1. Some section, 2. Some other section',
          [page.otherNeedsHeading]: '3. Foo section, 4. Bar section',
        })
      })

      it('when only one need is selected', () => {
        const needLinkedToReoffending = cas1OASysSupportingInformationMetaDataFactory
          .needsLinkedToReoffending()
          .build({ section: 1, sectionLabel: 'Some section' })
        const otherNeed = cas1OASysSupportingInformationMetaDataFactory
          .needsNotLinkedToReoffending()
          .build({ section: 2, sectionLabel: 'Some other section' })

        const page = new OptionalOasysSections({
          needsLinkedToReoffending: [needLinkedToReoffending],
          otherNeeds: [otherNeed],
        })

        page.allNeedsLinkedToReoffending = [needLinkedToReoffending]
        page.allOtherNeeds = [otherNeed]

        expect(page.response()).toEqual({
          [page.needsLinkedToReoffendingHeading]: `1. Some section`,
          [page.otherNeedsHeading]: `2. Some other section`,
        })
      })

      it('returns an empty object when no needs are selected', () => {
        const page = new OptionalOasysSections({})
        expect(page.response()).toEqual({})
      })

      it('returns an object with only one key if only needsLinkedToReoffending or otherNeeds are given', () => {
        const needLinkedToReoffending = cas1OASysSupportingInformationMetaDataFactory
          .needsLinkedToReoffending()
          .build({ section: 1, sectionLabel: 'Some section' })

        const pageWithOnlyNeedsLinkedToReoffending = new OptionalOasysSections({
          needsLinkedToReoffending: [needLinkedToReoffending],
        })
        pageWithOnlyNeedsLinkedToReoffending.allNeedsLinkedToReoffending = [needLinkedToReoffending]

        expect(pageWithOnlyNeedsLinkedToReoffending.response()).toEqual({
          [pageWithOnlyNeedsLinkedToReoffending.needsLinkedToReoffendingHeading]: '1. Some section',
        })

        const otherNeed = cas1OASysSupportingInformationMetaDataFactory
          .needsNotLinkedToReoffending()
          .build({ section: 2, sectionLabel: 'Some other section' })

        const pageWithOnlyOtherNeeds = new OptionalOasysSections({
          otherNeeds: [otherNeed],
        })
        pageWithOnlyOtherNeeds.allOtherNeeds = [otherNeed]

        expect(pageWithOnlyOtherNeeds.response()).toEqual({
          [pageWithOnlyOtherNeeds.otherNeedsHeading]: '2. Some other section',
        })
      })
    })
  })
})

import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { fromPartial } from '@total-typescript/shoehorn'
import { Cas1OASysMetadata } from '@approved-premises/api'
import { OasysNotFoundError } from '../../../../services/personService'
import { ApplicationService, PersonService } from '../../../../services'
import {
  applicationFactory,
  cas1OASysMetadataFactory,
  cas1OASysSupportingInformationMetaDataFactory,
} from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'

import OptionalOasysSections from './optionalOasysSections'
import config from '../../../../config'
import { DateFormats } from '../../../../utils/dateUtils'

jest.mock('../../../../services/personService.ts')

describe('OptionalOasysSections', () => {
  const oasysSelection = cas1OASysSupportingInformationMetaDataFactory.needsNotLinkedToReoffending().buildList(3)
  const needsLinkedToHarm = cas1OASysSupportingInformationMetaDataFactory.needsLinkedToHarm().buildList(2)

  const application = applicationFactory.build()

  describe('initialize', () => {
    const getOasysMetadataMock = jest.fn().mockResolvedValue(oasysSelection)
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

    const cas1OasysMetadata: Cas1OASysMetadata = cas1OASysMetadataFactory.build({
      supportingInformation: [...needsLinkedToHarm, ...needsLinkedToReoffending, ...otherNeeds],
    })

    const callInitialize = async (body = {}) => {
      return OptionalOasysSections.initialize(
        body,
        application,
        'some-token',
        fromPartial({
          personService,
          applicationService,
        }),
      )
    }

    beforeEach(() => {
      personService = createMock<PersonService>({
        getOasysMetadata: getOasysMetadataMock,
      })

      getOasysMetadataMock.mockResolvedValue(cas1OasysMetadata)
    })

    afterEach(() => {
      config.flags.oasysSixMonthRuleDisabled = false
    })

    it('calls the getOasysSelections method on the client with a token and the persons CRN when the six month rule is enabled', async () => {
      config.flags.oasysSixMonthRuleDisabled = false

      await callInitialize()

      expect(getOasysMetadataMock).toHaveBeenCalledWith(
        'some-token',
        application.person.crn,
        'completed_in_last_six_months',
      )
    })

    it('calls the getOasysSelections method on the client with a token and the persons CRN when the six month rule is disabled', async () => {
      config.flags.oasysSixMonthRuleDisabled = true

      await callInitialize()

      expect(getOasysMetadataMock).toHaveBeenCalledWith('some-token', application.person.crn, 'allow_all')
    })

    it('filters the OASys sections into needs linked to reoffending and other needs not linked to reoffending or harm', async () => {
      const page = await callInitialize()

      expect(page.allNeedsLinkedToReoffending).toEqual(needsLinkedToReoffending)
      expect(page.allOtherNeeds).toEqual(otherNeeds)
    })

    it('returns an empty array for the selected needs if the body is empty', async () => {
      const page = await callInitialize()

      expect(page.body.needsLinkedToReoffending).toEqual([])
      expect(page.body.otherNeeds).toEqual([])
    })

    it('initializes the OptionalOasysSections class with the selected sections when sections are a string', async () => {
      const page = await callInitialize({
        needsLinkedToReoffending: needsLinkedToReoffending[0].section.toString(),
        otherNeeds: [otherNeeds[0].section.toString(), otherNeeds[1].section.toString()],
      })

      expect(page.body.needsLinkedToReoffending).toEqual([needsLinkedToReoffending[0]])
      expect(page.body.otherNeeds).toEqual([otherNeeds[0], otherNeeds[1]])
    })

    it('initializes the OptionalOasysSections class with the selected sections when sections are section objects', async () => {
      const page = await callInitialize({
        needsLinkedToReoffending: [needsLinkedToReoffending[0]],
        otherNeeds: [otherNeeds[0], otherNeeds[1]],
      })

      expect(page.body.needsLinkedToReoffending).toEqual([needsLinkedToReoffending[0]])
      expect(page.body.otherNeeds).toEqual([otherNeeds[0], otherNeeds[1]])
    })

    it(`Don't error if an oasys section is null (APS-1772)`, async () => {
      getOasysMetadataMock.mockResolvedValue(
        cas1OASysMetadataFactory.build({
          supportingInformation: [...needsLinkedToHarm, null, ...needsLinkedToReoffending, ...otherNeeds],
        }),
      )

      const page = await callInitialize({
        needsLinkedToReoffending: [needsLinkedToReoffending[0]],
        otherNeeds: [otherNeeds[0], otherNeeds[1]],
      })

      expect(page.body.needsLinkedToReoffending).toEqual([needsLinkedToReoffending[0]])
      expect(page.body.otherNeeds).toEqual([otherNeeds[0], otherNeeds[1]])
    })

    it('sets oasysSuccess to false if an OasysNotFoundError is thrown', async () => {
      getOasysMetadataMock.mockImplementation(() => {
        throw new OasysNotFoundError('')
      })

      const page = await callInitialize()

      expect(page.oasysSuccess).toEqual(false)
      expect(page.body.needsLinkedToReoffending).toEqual([])
      expect(page.body.otherNeeds).toEqual([])
      expect(page.body.metaData).toEqual(undefined)
    })

    it('sets oasysSuccess to false if the API returns hasApplicableAssessment=false', async () => {
      getOasysMetadataMock.mockResolvedValue(cas1OASysMetadataFactory.oasysNotPresent().build())

      const page = await callInitialize()

      expect(page.oasysSuccess).toEqual(false)
    })

    it('stores the OASys metedata and current date in the body', async () => {
      jest.useFakeTimers()
      const importedDate = '2026-08-14'
      jest.setSystemTime(new Date(importedDate))
      const metaData = cas1OASysMetadataFactory.build()
      getOasysMetadataMock.mockResolvedValue(metaData)

      const page = await callInitialize()

      expect(page.oasysSuccess).toEqual(true)
      expect(page.body.metaData).toEqual({ ...metaData.assessmentMetadata, importedDate })
      jest.useRealTimers()
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
    const metaData = { ...cas1OASysMetadataFactory.build().assessmentMetadata, importedDate: '2026-08-14' }

    const notImportedMetaDataRow = { 'OASys assessment': 'OASys could not be imported' }

    const metaDataRows = {
      'OASys assessment': `Imported from OASys ${DateFormats.isoDateToUIDate('2026-08-14')}`,
      'OASys last updated': DateFormats.isoDateToUIDate(metaData.dateCompleted),
    }

    describe('should return a translated version of the OASys sections', () => {
      it('when every need is selected', () => {
        const page = new OptionalOasysSections({
          needsLinkedToReoffending: [needLinkedToReoffendingA, needLinkedToReoffendingB],
          otherNeeds: [otherNeedA, otherNeedB],
          metaData,
        })

        page.allNeedsLinkedToReoffending = [needLinkedToReoffendingA, needLinkedToReoffendingB]

        page.allOtherNeeds = [otherNeedA, otherNeedB]

        expect(page.response()).toEqual({
          [page.needsLinkedToReoffendingHeading]: '1. Some section, 2. Some other section',
          [page.otherNeedsHeading]: '3. Foo section, 4. Bar section',
          ...metaDataRows,
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
          metaData,
        })

        page.allNeedsLinkedToReoffending = [needLinkedToReoffending]
        page.allOtherNeeds = [otherNeed]

        expect(page.response()).toEqual({
          [page.needsLinkedToReoffendingHeading]: `1. Some section`,
          [page.otherNeedsHeading]: `2. Some other section`,
          ...metaDataRows,
        })
      })

      it('returns only metadata when no needs are selected', () => {
        const page = new OptionalOasysSections({})
        expect(page.response()).toEqual(notImportedMetaDataRow)
      })

      it('returns an object with only one non-metadata key if only needsLinkedToReoffending or otherNeeds are given', () => {
        const needLinkedToReoffending = cas1OASysSupportingInformationMetaDataFactory
          .needsLinkedToReoffending()
          .build({ section: 1, sectionLabel: 'Some section' })

        const pageWithOnlyNeedsLinkedToReoffending = new OptionalOasysSections({
          needsLinkedToReoffending: [needLinkedToReoffending],
        })
        pageWithOnlyNeedsLinkedToReoffending.allNeedsLinkedToReoffending = [needLinkedToReoffending]

        expect(pageWithOnlyNeedsLinkedToReoffending.response()).toEqual({
          [pageWithOnlyNeedsLinkedToReoffending.needsLinkedToReoffendingHeading]: '1. Some section',
          ...notImportedMetaDataRow,
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
          ...notImportedMetaDataRow,
        })
      })

      it('ignores sections that are set as `null`', () => {
        const page = new OptionalOasysSections({
          needsLinkedToReoffending: [needLinkedToReoffendingA, null, needLinkedToReoffendingB],
          otherNeeds: [otherNeedA, otherNeedB, null, null],
        })

        expect(page.response()).toEqual({
          [page.needsLinkedToReoffendingHeading]: '1. Some section, 2. Some other section',
          [page.otherNeedsHeading]: '3. Foo section, 4. Bar section',
          ...notImportedMetaDataRow,
        })
      })
    })
  })
})

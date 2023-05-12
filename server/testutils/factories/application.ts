/* istanbul ignore file */

import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { addDays } from 'date-fns'

import type { ApprovedPremisesApplication, OASysSection, ReleaseTypeOption } from '@approved-premises/api'

import { SentenceTypesT } from '../../form-pages/apply/reasons-for-placement/basic-information/sentenceType'
import type { ApTypes } from '../../form-pages/apply/reasons-for-placement/type-of-ap/apType'
import personFactory from './person'
import risksFactory from './risks'
import { DateFormats } from '../../utils/dateUtils'
import { PartnerAgencyDetails } from '../../@types/ui'

class ApplicationFactory extends Factory<ApprovedPremisesApplication> {
  withReleaseDate(releaseDate = DateFormats.dateObjToIsoDate(faker.date.soon())) {
    return this.params({
      data: {
        'basic-information': {
          'release-date': { releaseDate, knowReleaseDate: 'yes' },
          'placement-date': { startDateSameAsReleaseDate: 'yes' },
        },
      },
    })
  }

  emergencyApplication() {
    return this.withReleaseDate(DateFormats.dateObjToIsoDate(addDays(new Date(), 1)))
  }

  nonemergencyApplication() {
    return this.withReleaseDate(DateFormats.dateObjToIsoDate(addDays(new Date(), 200)))
  }

  withOptionalOasysSectionsSelected(needsLinkedToReoffending: Array<OASysSection>, otherNeeds: Array<OASysSection>) {
    return this.params({
      data: {
        'oasys-import': {
          'optional-oasys-sections': {
            needsLinkedToReoffending,
            otherNeeds,
          },
        },
      },
    })
  }

  withApType(apType: keyof ApTypes) {
    return this.withPageResponse({
      task: 'type-of-ap',
      page: 'ap-type',
      key: 'type',
      value: apType,
    })
  }

  withPostcodeArea(postcodeArea: string) {
    return this.withPageResponse({
      task: 'location-factors',
      page: 'describe-location-factors',
      key: 'postcodeArea',
      value: postcodeArea,
    })
  }

  withSentenceType(sentenceType: SentenceTypesT) {
    return this.withPageResponse({
      task: 'basic-information',
      page: 'sentence-type',
      key: 'sentenceType',
      value: sentenceType,
    })
  }

  withReleaseType(releaseType: ReleaseTypeOption) {
    return this.withPageResponse({
      task: 'basic-information',
      page: 'release-type',
      key: 'releaseType',
      value: releaseType,
    })
  }

  withContingencyPlanPartners(contingencyPlanPartners: Array<PartnerAgencyDetails>) {
    return this.withPageResponse({
      task: 'further-considerations',
      page: 'contingency-plan-partners',
      key: 'partnerAgencyDetails',
      value: contingencyPlanPartners,
    })
  }

  withPageResponse({ task, page, key, value }: { task: string; page: string; key: string; value: unknown }) {
    return this.params({
      data: {
        [task]: {
          [page]: { [key]: value },
        },
      },
    })
  }
}

export default ApplicationFactory.define(() => ({
  id: faker.string.uuid(),
  person: personFactory.build(),
  createdByUserId: faker.string.uuid(),
  schemaVersion: faker.string.uuid(),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  submittedAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  data: {},
  document: {},
  outdatedSchema: faker.datatype.boolean(),
  isWomensApplication: faker.datatype.boolean(),
  isPipeApplication: faker.datatype.boolean(),
  risks: risksFactory.build(),
  status: 'inProgress' as const,
}))

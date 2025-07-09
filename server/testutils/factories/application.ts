/* istanbul ignore file */

import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { addDays } from 'date-fns'

import type {
  ApprovedPremisesApplication,
  AssessmentDecision,
  Cas1ApplicationUserDetails,
  Cas1OASysSupportingInformationQuestionMetaData,
  ReleaseTypeOption,
  SentenceTypeOption,
} from '@approved-premises/api'

import { fullPersonFactory, restrictedPersonFactory } from './person'
import risksFactory from './risks'
import { DateFormats } from '../../utils/dateUtils'
import { BackwardsCompatibleApplyApType, PartnerAgencyDetails } from '../../@types/ui'
import { apAreaFactory } from './referenceData'

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

  withOptionalOasysSectionsSelected(
    needsLinkedToReoffending: Array<Cas1OASysSupportingInformationQuestionMetaData>,
    otherNeeds: Array<Cas1OASysSupportingInformationQuestionMetaData>,
  ) {
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

  withApType(apType: BackwardsCompatibleApplyApType) {
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

  withSentenceType(sentenceType: SentenceTypeOption) {
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

  withFullPerson() {
    return this.params({
      person: fullPersonFactory.build(),
    })
  }

  completed(assessmentDecision: AssessmentDecision) {
    return this.params({
      status: 'awaitingPlacement',
      assessmentDecision,
      assessmentDecisionDate: DateFormats.dateObjToIsoDateTime(faker.date.past()),
      assessmentId: faker.string.uuid(),
    })
  }
}

export const applicationUserDetailsFactory = new Factory<Cas1ApplicationUserDetails>(() => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  telephoneNumber: faker.phone.number(),
}))

const apTypeField = ():
  | Pick<ApprovedPremisesApplication, 'isEsapApplication'>
  | Pick<ApprovedPremisesApplication, 'isPipeApplication'>
  | Pick<ApprovedPremisesApplication, 'apType'> => {
  return faker.helpers.arrayElement([
    { isEsapApplication: true },
    { isPipeApplication: true },
    { apType: faker.helpers.arrayElement(['normal', 'esap', 'mhapElliottHouse', 'mhapStJosephs', 'pipe', 'rfap']) },
  ])
}

export default ApplicationFactory.define(() => ({
  type: 'CAS1',
  id: faker.string.uuid(),
  person: faker.helpers.arrayElement([fullPersonFactory.build(), restrictedPersonFactory.build()]),
  createdByUserId: faker.string.uuid(),
  schemaVersion: faker.string.uuid(),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  submittedAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  data: {},
  document: {},
  outdatedSchema: faker.datatype.boolean(),
  isWomensApplication: faker.datatype.boolean(),
  risks: risksFactory.build(),
  status: 'started' as const,
  personStatusOnSubmission: 'InCustody' as const,
  apArea: apAreaFactory.build(),
  caseManagerIsNotApplicant: faker.datatype.boolean(),
  caseManagerUserDetails: applicationUserDetailsFactory.build(),
  applicantUserDetails: applicationUserDetailsFactory.build(),
  licenceExpiryDate: DateFormats.dateObjToIsoDateTime(faker.date.future()),
  ...apTypeField(),
}))

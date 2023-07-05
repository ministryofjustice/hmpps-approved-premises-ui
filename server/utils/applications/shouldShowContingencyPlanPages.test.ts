import { addDays } from 'date-fns'
import { applicationFactory } from '../../testutils/factories'
import {
  shouldShowContingencyPlanPartnersPages,
  shouldShowContingencyPlanQuestionsPage,
} from './shouldShowContingencyPlanPages'
import { mockOptionalQuestionResponse, mockQuestionResponse } from '../../testutils/mockQuestionResponse'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'
import { DateFormats } from '../dateUtils'

jest.mock('../retrieveQuestionResponseFromFormArtifact')
jest.mock('./arrivalDateFromApplication')

const application = applicationFactory.build()

describe('shouldShowContingencyPlanPartnersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  it('returns false if none of the conditions are met', () => {
    mockQuestionResponse({ sentenceType: 'ipp', type: 'other' })

    expect(shouldShowContingencyPlanPartnersPages(application)).toEqual(false)
  })

  it('returns true if the application has a sentence type of "Community Order/SSO"', () => {
    mockQuestionResponse({ sentenceType: 'communityOrder' })

    expect(shouldShowContingencyPlanPartnersPages(application)).toEqual(true)
  })

  it('returns true if the application has a sentence type of "Non-statutory, MAPPA case"', () => {
    mockQuestionResponse({ sentenceType: 'nonStatutory' })

    expect(shouldShowContingencyPlanPartnersPages(application)).toEqual(true)
  })

  it('returns true if the application has a release type of "Post Sentence Supervision (PSS)"', () => {
    mockQuestionResponse({ sentenceType: 'ipp', releaseType: 'pss' })

    expect(shouldShowContingencyPlanPartnersPages(application)).toEqual(true)
  })

  it('returns true if the application has an end date for "Post Sentence Supervision (PSS)"', () => {
    mockOptionalQuestionResponse({ pssDate: '20/02/2023' })

    expect(shouldShowContingencyPlanPartnersPages(application)).toEqual(true)
  })

  it('returns true if the application has a AP type of "ESAP"', () => {
    mockQuestionResponse({ type: 'esap' })

    expect(shouldShowContingencyPlanPartnersPages(application)).toEqual(true)
  })
})

describe('shouldShowContingencyPlanQuestionsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns true if the application arrival date is in less than or equal to 28 days"', () => {
    ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(DateFormats.dateObjToIsoDate(new Date()))

    expect(shouldShowContingencyPlanQuestionsPage(application)).toEqual(true)
  })

  it('returns true if the application arrival date is in less than 28 days"', () => {
    const today = new Date()
    ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(DateFormats.dateObjToIsoDate(addDays(today, 28)))

    expect(shouldShowContingencyPlanQuestionsPage(application)).toEqual(true)
  })
})

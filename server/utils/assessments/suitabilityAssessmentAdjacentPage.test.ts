/* eslint-disable consistent-return */

import { upper } from 'case'
import { assessmentFactory } from '../../testutils/factories'
import { noticeTypeFromApplication } from '../applications/noticeTypeFromApplication'
import { shouldShowContingencyPlanPartnersPages } from '../applications/shouldShowContingencyPlanPages'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import { suitabilityAssessmentAdjacentPage } from './suitabilityAssessmentAdjacentPage'

jest.mock('../retrieveQuestionResponseFromFormArtifact')
jest.mock('../applications/shouldShowContingencyPlanPages')
jest.mock('../applications/noticeTypeFromApplication')

describe('suitabilityAssessmentAdjacentPage', () => {
  ;(
    [
      {
        name: 'rfap',
        pageName: 'rfap-suitability',
        applicationQuestion: { name: 'needARfap', answer: 'yes' },
      },
      {
        name: 'esap',
        pageName: 'esap-suitability',
        applicationQuestion: { name: 'type', answer: 'esap' },
      },
      {
        name: 'pipe',
        pageName: 'pipe-suitability',
        applicationQuestion: { name: 'type', answer: 'pipe' },
      },
    ] as const
  ).forEach(apType => {
    beforeEach(() => {
      jest.resetAllMocks()
    })

    describe(`${upper(apType.name)}`, () => {
      describe('next page', () => {
        describe(`an application that solely needs an ${apType.name}`, () => {
          it(`returns ${apType.name}-suitability if the ${apType.name} suitability page hasnt been completed`, () => {
            ;(
              retrieveOptionalQuestionResponseFromFormArtifact as jest.MockedFn<
                typeof retrieveOptionalQuestionResponseFromFormArtifact
              >
            ).mockImplementation((_, __, question) => {
              if (apType.applicationQuestion.name === question) {
                return apType.applicationQuestion.answer
              }
            })

            expect(suitabilityAssessmentAdjacentPage(assessmentFactory.build(), 'suitability-assessment')).toEqual(
              `${apType.name}-suitability`,
            )
          })

          it(`returns an empty string if the ${apType.name} suitability page has been completed`, () => {
            ;(
              retrieveOptionalQuestionResponseFromFormArtifact as jest.MockedFn<
                typeof retrieveOptionalQuestionResponseFromFormArtifact
              >
            ).mockReturnValue(`yes`)

            expect(suitabilityAssessmentAdjacentPage(assessmentFactory.build(), apType.pageName)).toEqual('')
          })
        })

        describe(`an emergency application that needs an ${apType.name}`, () => {
          it(`returns ${apType.name}-suitability if the ${apType.name} suitability page hasnt been completed`, () => {
            ;(
              retrieveOptionalQuestionResponseFromFormArtifact as jest.MockedFn<
                typeof retrieveOptionalQuestionResponseFromFormArtifact
              >
            ).mockImplementation((_, __, question) => {
              if (apType.applicationQuestion.name === question) {
                return apType.applicationQuestion.answer
              }
            })
            ;(
              shouldShowContingencyPlanPartnersPages as jest.MockedFn<typeof shouldShowContingencyPlanPartnersPages>
            ).mockReturnValueOnce(true)

            expect(suitabilityAssessmentAdjacentPage(assessmentFactory.build(), 'suitability-assessment')).toEqual(
              `${apType.name}-suitability`,
            )
          })

          it(`returns contingency-plan-suitability if the ${apType.name} suitability page has been completed`, () => {
            ;(
              retrieveOptionalQuestionResponseFromFormArtifact as jest.MockedFn<
                typeof retrieveOptionalQuestionResponseFromFormArtifact
              >
            ).mockImplementation((_, __, question) => {
              if (apType.applicationQuestion.name === question) {
                return apType.applicationQuestion.answer
              }

              if (question === 'agreeWithShortNoticeReason') {
                return 'yes'
              }

              if (question === 'contingencyPlanSufficient') {
                return ''
              }
            })
            ;(
              shouldShowContingencyPlanPartnersPages as jest.MockedFn<typeof shouldShowContingencyPlanPartnersPages>
            ).mockReturnValueOnce(true)

            expect(suitabilityAssessmentAdjacentPage(assessmentFactory.build(), apType.pageName)).toEqual(
              `contingency-plan-suitability`,
            )
          })

          it(`returns an empty string if the ${apType.name} suitability + contingency plan suitability pages have been completed`, () => {
            ;(
              retrieveOptionalQuestionResponseFromFormArtifact as jest.MockedFn<
                typeof retrieveOptionalQuestionResponseFromFormArtifact
              >
            ).mockReturnValue(`yes`)
            ;(
              shouldShowContingencyPlanPartnersPages as jest.MockedFn<typeof shouldShowContingencyPlanPartnersPages>
            ).mockReturnValueOnce(true)

            expect(
              suitabilityAssessmentAdjacentPage(assessmentFactory.build(), 'contingency-plan-suitability'),
            ).toEqual('')
          })
        })

        describe(`a short notice application that needs an ${apType.name}`, () => {
          it(`returns ${apType.name}-suitability if the ${apType.name} suitability page hasnt been completed`, () => {
            ;(
              retrieveOptionalQuestionResponseFromFormArtifact as jest.MockedFn<
                typeof retrieveOptionalQuestionResponseFromFormArtifact
              >
            ).mockImplementation((_, __, question) => {
              if (apType.applicationQuestion.name === question) {
                return apType.applicationQuestion.answer
              }
            })
            ;(
              shouldShowContingencyPlanPartnersPages as jest.MockedFn<typeof shouldShowContingencyPlanPartnersPages>
            ).mockReturnValueOnce(true)

            expect(suitabilityAssessmentAdjacentPage(assessmentFactory.build(), 'suitability-assessment')).toEqual(
              `${apType.name}-suitability`,
            )
          })

          it(`returns application-timeliness if the ${apType.name} suitability page has been completed`, () => {
            ;(noticeTypeFromApplication as jest.MockedFn<typeof noticeTypeFromApplication>).mockReturnValueOnce(
              `short_notice`,
            )

            expect(suitabilityAssessmentAdjacentPage(assessmentFactory.build(), apType.pageName)).toEqual(
              `application-timeliness`,
            )
          })

          it(`returns an empty string if the ${apType.name} suitability + application timeliness pages have been completed`, () => {
            ;(
              retrieveOptionalQuestionResponseFromFormArtifact as jest.MockedFn<
                typeof retrieveOptionalQuestionResponseFromFormArtifact
              >
            ).mockReturnValue(`yes`)
            ;(noticeTypeFromApplication as jest.MockedFn<typeof noticeTypeFromApplication>).mockReturnValueOnce(
              `short_notice`,
            )

            expect(suitabilityAssessmentAdjacentPage(assessmentFactory.build(), 'application-timeliness')).toEqual('')
          })
        })
      })
    })

    describe('previous page', () => {
      describe(`${apType.pageName}`, () => {
        it(`returns "suitability-assessment" from the ${apType.name} page`, () => {
          ;(
            retrieveOptionalQuestionResponseFromFormArtifact as jest.MockedFn<
              typeof retrieveOptionalQuestionResponseFromFormArtifact
            >
          ).mockImplementation((_, __, question) => {
            if (apType.applicationQuestion.name === question) {
              return apType.applicationQuestion.answer
            }
          })

          expect(
            suitabilityAssessmentAdjacentPage(assessmentFactory.build(), apType.pageName, { returnPreviousPage: true }),
          ).toEqual('suitability-assessment')
        })

        it(`returns ${apType.name}-suitability from the application-timeliness page`, () => {
          ;(
            retrieveOptionalQuestionResponseFromFormArtifact as jest.MockedFn<
              typeof retrieveOptionalQuestionResponseFromFormArtifact
            >
          ).mockImplementation((_, __, question) => {
            if (apType.applicationQuestion.name === question) {
              return apType.applicationQuestion.answer
            }
          })
          ;(noticeTypeFromApplication as jest.MockedFn<typeof noticeTypeFromApplication>).mockReturnValueOnce(
            'short_notice',
          )

          expect(
            suitabilityAssessmentAdjacentPage(assessmentFactory.build(), 'application-timeliness', {
              returnPreviousPage: true,
            }),
          ).toEqual(apType.pageName)
        })

        it(`returns application-timeliness from the contingency-plan-suitability page`, () => {
          ;(noticeTypeFromApplication as jest.MockedFn<typeof noticeTypeFromApplication>).mockReturnValue(
            'short_notice',
          )
          ;(
            shouldShowContingencyPlanPartnersPages as jest.MockedFn<typeof shouldShowContingencyPlanPartnersPages>
          ).mockReturnValueOnce(true)

          expect(
            suitabilityAssessmentAdjacentPage(assessmentFactory.build(), 'contingency-plan-suitability', {
              returnPreviousPage: true,
            }),
          ).toEqual('application-timeliness')
        })
      })
    })
  })
})

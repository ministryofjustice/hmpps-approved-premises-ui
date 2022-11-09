import type { TaskListErrors, YesNoOrIDK, YesOrNo } from '@approved-premises/ui'
import { Application } from '../../../@types/shared'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'
import { pascalCase, sentenceCase } from '../../../utils/utils'

import TasklistPage from '../../tasklistPage'

export const additionalNeeds = {
  mobility: 'Mobility needs',
  visualImpairment: 'Visual impairment',
  learningDisability: 'Learning disability',
  hearingImpairment: 'Hearing impairment',
  neurodivergentConditions: 'Neurodivergent conditions',
  other: 'Other',
  none: 'None of the above',
}

type AdditionalNeed = keyof typeof additionalNeeds

export default class AccessNeeds implements TasklistPage {
  name = 'access-needs'

  title = 'Access needs'

  questions = {
    needs: {
      question: `Does ${this.application.person.name} have any of the following needs?`,
      hint: `For example, if ${this.application.person.name} has a visual impairment, uses a hearing aid or has a learning difficulty.`,
    },
    religiousAndCulturalNeeds: {
      question: `Does ${this.application.person.name} have any religious or cultural needs?`,
      furtherDetails: `Details of religious or cultural needs`,
    },
    interpreter: {
      question: `Does ${this.application.person.name} need an interpreter?`,
      language: 'Which language is an interpreter needed for?',
    },
    careActAssessmentCompleted: 'Has a care act assessment been completed?',
  }

  body: {
    additionalNeeds: AdditionalNeed[]
    religiousOrCulturalNeeds: YesOrNo
    religiousOrCulturalNeedsDetails: string
    careActAssessmentCompleted: YesNoOrIDK
    needsInterpreter: YesOrNo
    interpreterLanguage: string
  }

  constructor(body: Record<string, unknown>, private readonly application: Application) {
    this.body = {
      additionalNeeds: body.additionalNeeds ? ([body.additionalNeeds].flat() as Array<AdditionalNeed>) : [],
      religiousOrCulturalNeeds: body.religiousOrCulturalNeeds as YesOrNo,
      religiousOrCulturalNeedsDetails: (body.religiousOrCulturalNeedsDetails as string) || '',
      needsInterpreter: body.needsInterpreter as YesOrNo,
      interpreterLanguage: body.interpreterLanguage as string,
      careActAssessmentCompleted: body.careActAssessmentCompleted as YesNoOrIDK,
    }
  }

  previous() {
    return ''
  }

  next() {
    return this.body.additionalNeeds.includes('mobility') ? 'access-needs-mobility' : 'covid'
  }

  response() {
    const response = {
      [this.title]: {
        [this.questions.needs.question]: this.body.additionalNeeds
          .map((need, i) => (i < 1 ? additionalNeeds[need] : additionalNeeds[need].toLowerCase()))
          .join(', '),
        [this.questions.religiousAndCulturalNeeds.question]: sentenceCase(this.body.religiousOrCulturalNeeds),
        [this.questions.religiousAndCulturalNeeds.furtherDetails]: this.body.religiousOrCulturalNeedsDetails,
        [this.questions.interpreter.question]: sentenceCase(this.body.needsInterpreter),
        [this.questions.careActAssessmentCompleted]:
          this.body.careActAssessmentCompleted === 'yes' || this.body.careActAssessmentCompleted === 'no'
            ? pascalCase(this.body.careActAssessmentCompleted)
            : "I don't know",
      },
    }
    if (this.body.needsInterpreter === 'yes') {
      return {
        [this.title]: {
          ...response[this.title],
          [this.questions.interpreter.language]: this.body.interpreterLanguage,
        },
      }
    }
    if (this.body.religiousOrCulturalNeeds === 'yes') {
      return {
        [this.title]: {
          ...response[this.title],
          religiousOrCulturalNeedsDetails: this.body.religiousOrCulturalNeedsDetails,
        },
      }
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.additionalNeeds.length) {
      errors.additionalNeeds = `You must confirm whether ${this.application.person.name} has any additional needs`
    }
    if (!this.body.religiousOrCulturalNeeds) {
      errors.religiousOrCulturalNeeds = `You must confirm whether ${this.application.person.name} has any religious or cultural needs`
    }
    if (!this.body.needsInterpreter) {
      errors.needsInterpreter = 'You must confirm the need for an interpreter'
    }
    if (!this.body.careActAssessmentCompleted) {
      errors.careActAssessmentCompleted = 'You must confirm whether a care act assessment has been completed'
    }

    return errors
  }

  needsCheckboxes() {
    return convertKeyValuePairToCheckBoxItems(additionalNeeds, this.body.additionalNeeds)
  }
}

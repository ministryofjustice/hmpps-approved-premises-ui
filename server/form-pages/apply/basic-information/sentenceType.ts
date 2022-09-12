import TasklistPage from '../../tasklistPage'

export enum SentenceTypes {
  standardDeterminate = 'Standard determinate custody',
  communityOrder = 'Community Order',
  bailPlacement = 'Bail placement',
  extendedDeterminate = 'Extended determinate custody',
  ipp = 'Indeterminate Public Protection',
  nonStatutory = 'Non-statutory',
  life = 'Life sentence',
}

export default class SentenceType implements TasklistPage {
  name = 'sentence-type'

  title = 'Which of the following best describes the sentence type?'

  body: { sentenceType: keyof SentenceTypes }

  constructor(body: Record<string, unknown>) {
    this.body = {
      sentenceType: body.sentenceType as keyof SentenceTypes,
    }
  }

  next() {
    switch (this.body.sentenceType) {
      case 'standardDeterminate':
        return 'release-type'
      case 'communityOrder':
        return 'situation'
      case 'bailPlacement':
        return 'situation'
      case 'extendedDeterminate':
        return 'release-type'
      case 'ipp':
        return 'release-type'
      case 'life':
        return 'release-type'
      default:
        throw new Error('The release type is invalid')
    }
  }

  previous() {
    return 'confirm-details'
  }

  errors() {
    const errors = []

    if (!this.body.sentenceType) {
      errors.push({
        propertyName: 'sentenceType',
        errorType: 'blank',
      })
    }

    return errors
  }

  items() {
    return Object.keys(SentenceTypes).map(key => {
      return {
        value: key,
        text: SentenceTypes[key],
        checked: this.body.sentenceType === key,
      }
    })
  }
}

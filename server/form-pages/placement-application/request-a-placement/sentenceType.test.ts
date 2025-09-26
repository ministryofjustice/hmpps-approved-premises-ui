import { itShouldHavePreviousValue } from '../../shared/index'

import SentenceType from './sentenceType'

describe('SentenceType', () => {
  itShouldHavePreviousValue(new SentenceType({}), 'sentence-type-check')
})

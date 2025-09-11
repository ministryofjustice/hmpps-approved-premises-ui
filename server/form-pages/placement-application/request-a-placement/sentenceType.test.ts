import { itShouldHavePreviousValue } from '../../shared-examples/index'

import SentenceType from './sentenceType'

describe('SentenceType', () => {
  itShouldHavePreviousValue(new SentenceType({}), 'sentence-type-check')
})

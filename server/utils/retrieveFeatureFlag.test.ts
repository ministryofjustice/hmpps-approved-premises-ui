import { FeatureFlag } from '../services/featureFlagService'
import { retrieveFeatureFlag } from './retrieveFeatureFlag'

describe('retrieveFeatureFlag', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it.each([true, false])('returns the value as a boolean', value => {
    process.env['test-flag'] = value.toString()
    expect(retrieveFeatureFlag('test-flag' as FeatureFlag)).toBe(value)
  })
})

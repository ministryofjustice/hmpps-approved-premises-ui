/* eslint-disable max-classes-per-file */
import 'reflect-metadata'
import {
  applyYesOrNo,
  yesOrNoResponseWithDetail,
  yesNoOrDontKnowResponseWithDetail,
  getTask,
  getSection,
} from './index'

describe('utils', () => {
  describe('applyYesOrNo', () => {
    it('returns a keypair of a yes/no answer and details', () => {
      const body = { foo: 'yes', fooDetail: 'Some Detail', something: 'else' }

      expect(applyYesOrNo('foo', body)).toEqual({ foo: 'yes', fooDetail: 'Some Detail' })
    })

    it('accepts a generic', () => {
      const body = { foo: 'yes', fooDetail: 'Some Detail', something: 'else' }

      expect(applyYesOrNo<'foo' | 'bar'>('foo', body)).toEqual({ foo: 'yes', fooDetail: 'Some Detail' })
    })
  })

  describe('yesOrNoResponseWithDetail', () => {
    it('returns a response with detail if the answer is yes', () => {
      const body = { foo: 'yes', fooDetail: 'Some Detail' }

      expect(yesOrNoResponseWithDetail('foo', body)).toEqual('Yes - Some Detail')
    })

    it('returns no detail if the answer is no', () => {
      const body = { foo: 'no' }

      expect(yesOrNoResponseWithDetail('foo', body)).toEqual('No')
    })
  })

  describe('yesNoOrDontKnowResponseWithDetail', () => {
    it('returns a response with detail if the answer is yes', () => {
      const body = { foo: 'yes', fooDetail: 'Some Detail' }

      expect(yesNoOrDontKnowResponseWithDetail('foo', body)).toEqual('Yes - Some Detail')
    })

    it('returns No if the answer is no', () => {
      const body = { foo: 'no' }

      expect(yesNoOrDontKnowResponseWithDetail('foo', body)).toEqual('No')
    })

    it("returns Don't know if the answer is iDontKnow", () => {
      const body = { foo: 'iDontKnow' }

      expect(yesNoOrDontKnowResponseWithDetail('foo', body)).toEqual("Don't know")
    })
  })

  describe('getTask', () => {
    it('fetches metadata for a specific task and pages', () => {
      class Task {}
      class Page1 {}
      class Page2 {}

      Reflect.defineMetadata('page:name', 'Page 1', Page1)
      Reflect.defineMetadata('page:name', 'Page 2', Page2)

      Reflect.defineMetadata('task:slug', 'slug', Task)
      Reflect.defineMetadata('task:name', 'Name', Task)
      Reflect.defineMetadata('task:pages', [Page1, Page2], Task)

      expect(getTask(Task)).toEqual({ id: 'slug', title: 'Name', pages: { 'Page 1': Page1, 'Page 2': Page2 } })
    })
  })

  describe('getSection', () => {
    it('fetches metadata for a specific section and tasks', () => {
      class Section {}
      class Task {}

      class Page1 {}
      class Page2 {}

      Reflect.defineMetadata('page:name', 'Page 1', Page1)
      Reflect.defineMetadata('page:name', 'Page 2', Page2)

      Reflect.defineMetadata('task:slug', 'slug', Task)
      Reflect.defineMetadata('task:name', 'Name', Task)
      Reflect.defineMetadata('task:pages', [Page1, Page2], Task)

      Reflect.defineMetadata('section:name', 'Section', Section)
      Reflect.defineMetadata('section:tasks', [Task], Section)

      expect(getSection(Section)).toEqual({
        title: 'Section',
        tasks: [getTask(Task)],
      })
    })
  })
})

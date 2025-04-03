import { ApprovedPremisesApplication } from '@approved-premises/api'
import Page from './page.decorator'
import { applicationFactory } from '../../../testutils/factories'

describe('tasklistPageDecorator', () => {
  describe('with a simple class', () => {
    @Page({
      bodyProperties: ['foo', 'bar', 'baz'],
      name: 'Some Name',
      controllerActions: { update: 'foo' },
    })
    class SimpleClass {
      name: string

      constructor(readonly body: Record<string, unknown>) {}
    }

    const simpleClass = new SimpleClass({ foo: '1', bar: '2', baz: '3', something: 'else' })

    it('adds properties to the class instance', () => {
      expect(simpleClass.body).toEqual({ foo: '1', bar: '2', baz: '3' })
      expect(simpleClass.name).toEqual('Some Name')
    })

    it('sets metadata for the class', () => {
      const name = Reflect.getMetadata('page:name', SimpleClass)
      const className = Reflect.getMetadata('page:className', SimpleClass)
      const bodyProperties = Reflect.getMetadata('page:bodyProperties', SimpleClass)
      const controllerAction = Reflect.getMetadata('page:controllerActions:update', SimpleClass)

      expect(name).toEqual('Some Name')
      expect(className).toEqual('SimpleClass')
      expect(bodyProperties).toEqual(['foo', 'bar', 'baz'])
      expect(controllerAction).toEqual('foo')
    })
  })

  it('adds additional arguments to the class instance', () => {
    @Page({
      bodyProperties: ['foo', 'bar', 'baz'],
      name: 'Some Name',
    })
    class ClassWithApplication {
      constructor(
        readonly body: Record<string, unknown>,
        readonly application: ApprovedPremisesApplication,
      ) {}
    }

    const application = applicationFactory.build()
    const classWithApplication = new ClassWithApplication(
      { foo: '1', bar: '2', baz: '3', something: 'else' },
      application,
    )

    expect(classWithApplication.application).toEqual(application)
  })
})

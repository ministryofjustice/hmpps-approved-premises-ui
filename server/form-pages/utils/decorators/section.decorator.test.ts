import Section from './section.decorator'

describe('Task', () => {
  it('records metadata about a class', () => {
    class Task1 {}

    class Task2 {}

    class Task3 {}

    @Section({ name: 'My Section', tasks: [Task1, Task2, Task3] })
    class MySection {}

    const name = Reflect.getMetadata('section:name', MySection)
    const tasks = Reflect.getMetadata('section:tasks', MySection)

    expect(name).toEqual('My Section')
    expect(tasks).toEqual([Task1, Task2, Task3])
  })
})

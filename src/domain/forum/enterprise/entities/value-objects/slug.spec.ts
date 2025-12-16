import { Slug } from './slug'

test('it should be able to create a new slug from text', () => {
  const slug = Slug.createFromText('How to learn Node.js?')

  expect(slug.value).toEqual('how-to-learn-nodejs')
})

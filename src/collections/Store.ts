import type { CollectionConfig } from 'payload'

export const Store: CollectionConfig = {
  slug: 'store',
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'menu',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'price',
          type: 'number',
        },
      ],
    },
  ],
}

import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  fields: [
    {
      name: 'orderNumber',
      type: 'number',
    },
    {
      name: 'realisationDate',
      type: 'date',
    },
    {
      name: 'store',
      type: 'relationship',
      relationTo: 'store',
    },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'tax',
      type: 'number',
    },
    {
      name: 'participants',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
  ],
}

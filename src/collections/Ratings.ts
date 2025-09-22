import type { CollectionConfig } from 'payload'

export const Ratings: CollectionConfig = {
  slug: 'ratings',
  access: {
    read: () => true,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['orderNumber', 'rater', 'ratee', 'value', 'createdAt'],
  },
  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
    },
    {
      name: 'orderNumber',
      type: 'number',
      required: true,
    },
    {
      name: 'rater',
      label: 'Oceniający (user id)',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'ratee',
      label: 'Oceniany (user id)',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'value',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
    },
    {
      name: 'createdAt',
      type: 'date',
      admin: { position: 'sidebar' },
    },
  ],
}

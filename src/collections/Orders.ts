import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  fields: [
    {
      name: 'founder',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', description: 'Założyciel' },
    },
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
      name: 'taxType',
      type: 'select',
      options: [
        { label: 'Percentage', value: 'percentage' },
        { label: 'Fixed', value: 'fixed' },
      ],
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
    {
      name: 'items',
      label: 'Items',
      type: 'array',
      admin: {
        description: 'Per-user items added to this order',
      },
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0.01,
          validate: (val: unknown) =>
            typeof val === 'number' && val >= 0.01 ? true : 'Cena musi być ≥ 0,01 PLN',
        },
        { name: 'userId', type: 'text', required: true },
        { name: 'userName', type: 'text', required: true },
        { name: 'createdAt', type: 'date' },
      ],
    },
  ],
}

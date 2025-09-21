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
      name: 'distributionUntil',
      label: 'Aktywne do',
      type: 'date',
      admin: { description: 'Moment zakończenia (po tej dacie ogłoszenie znika z listy)' },
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
  { label: 'Procentowo', value: 'percentage' },
  { label: 'Stała kwota', value: 'fixed' },
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
      name: 'carts',
      label: 'Koszyki',
      type: 'array',
      admin: {
        description: 'Koszyki użytkowników z miejscem dostawy/odbioru',
      },
      fields: [
        { name: 'userId', type: 'text', required: true },
        { name: 'userName', type: 'text' },
        {
          name: 'location',
          label: 'Miejsce dostarczenia / odbioru',
          type: 'text',
        },
        { name: 'createdAt', type: 'date' },
        { name: 'updatedAt', type: 'date' },
      ],
    },
    {
      name: 'items',
      label: 'Pozycje',
      type: 'array',
      admin: {
        description: 'Pozycje dodane przez użytkowników do ogłoszenia',
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

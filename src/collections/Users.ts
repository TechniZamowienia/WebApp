import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'createdAt'],
  },
  timestamps: true,
  access: {
    read: () => true,
    create: () => true,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'clerkId',
      label: 'Clerk User ID',
      type: 'text',
      unique: true,
      admin: { position: 'sidebar', description: 'Powiązanie z kontem Clerk' },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Imię i nazwisko',
    },
    {
      name: 'email',
      type: 'email',
      unique: true,
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'role',
      type: 'select',
      label: 'Rola',
      options: [
        { label: 'Ogłaszający', value: 'oglaszajacy' },
        { label: 'Zamawiający', value: 'zamawiajacy' },
      ],
      defaultValue: 'zamawiajacy',
      required: true,
    },
    {
      name: 'ratingAverage',
      label: 'Średnia ocena',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    {
      name: 'ratingCount',
      label: 'Liczba ocen',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    {
      name: 'ratingSum',
      label: 'Suma ocen (wewn.)',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Pole pomocnicze do wyliczania średniej' },
    },
  ],
}

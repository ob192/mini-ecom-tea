import { z } from 'zod';
import { isValidUaPhone } from '@/lib/format';

/*
  Checkout validation schema.
  Delivery is Nova Poshta: either to a branch/postomat (needs a warehouse) or by
  courier to an address (needs a street address). City is required for both.
*/
export const checkoutSchema = z
    .object({
      first: z.string().trim().min(1, "Вкажіть ім'я").min(2, "Закоротке ім'я"),
      last: z.string().trim().min(1, 'Вкажіть прізвище'),
      phone: z
          .string()
          .trim()
          .min(1, 'Вкажіть номер телефону')
          .refine(isValidUaPhone, 'Невірний номер телефону'),

      deliveryMethod: z.enum(['np_warehouse', 'np_courier']),
      cityRef: z.string().trim().min(1, 'Оберіть місто'),
      cityName: z.string().trim().default(''),
      warehouseRef: z.string().trim().default(''),
      warehouse: z.string().trim().default(''),
      address: z.string().trim().default(''),

      // Honeypot — must stay empty. Not shown to users.
      company: z.string().optional(),
    })
    .superRefine((v, ctx) => {
      if (v.deliveryMethod === 'np_warehouse' && !v.warehouseRef) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['warehouseRef'], message: 'Оберіть відділення' });
      }
      if (v.deliveryMethod === 'np_courier' && v.address.trim().length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address'],
          message: 'Уточніть адресу (вул., буд., кв.)',
        });
      }
    });

export type CheckoutValues = z.infer<typeof checkoutSchema>;
import { z } from 'zod';
import { PAYMENT_METHODS } from '@/types/sale';

export const addCartItemSchema = z.object({
  partId: z.number().int().positive('Produto inválido'),
  quantity: z
    .number({ invalid_type_error: 'Quantidade inválida' })
    .int('Quantidade deve ser inteira')
    .min(1, 'Quantidade mínima é 1'),
});

export const removeCartItemSchema = z.object({
  masterEmail: z.string().email('E-mail master inválido').optional(),
  masterSenha: z.string().min(1, 'Senha master é obrigatória').optional(),
});

export const checkoutSchema = z
  .object({
    paymentMethod: z.enum(PAYMENT_METHODS as [string, ...string[]]),
    amountPaid: z.number().min(0, 'Valor pago inválido').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === 'DINHEIRO' && (data.amountPaid === undefined || data.amountPaid < 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Valor pago é obrigatório para pagamento em dinheiro',
        path: ['amountPaid'],
      });
    }
  });

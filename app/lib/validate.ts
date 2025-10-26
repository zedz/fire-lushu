import { z } from "zod";
export const schema = z.object({
  current_age: z.number().min(14).max(100),
  target_fire_age: z.number().min(14).max(90),
  traditional_retirement_age: z.number().min(50).max(80).optional(),

  monthly_total_income: z.number().min(0),

  has_property: z.boolean().optional(),
  owner_occ_has_mortgage: z.boolean().optional(),
  owner_occ_mortgage_monthly: z.number().min(0).optional(),
  owner_occ_mortgage_payoff_ym: z.string().optional(),

  has_investment_property: z.boolean().optional(),
  invprop_has_mortgage: z.boolean().optional(),
  invprop_prepayoff_net_rent_monthly: z.number().min(0).optional(),
  invprop_postpayoff_net_rent_monthly: z.number().min(0).optional(),
  invprop_payoff_ym: z.string().optional(),
  invprop_net_rent_monthly: z.number().min(0).optional(),

  monthly_total_expenses: z.number().min(0),

  current_portfolio_value: z.number().min(0),
  contribution_rate_of_net_income: z.number().min(0).max(1),
  pre_fire_real_return_rate: z.number().min(0).max(0.08),
  post_fire_real_return_rate: z.number().min(0).max(0.08).optional(),

  fire_monthly_basic: z.number().min(0),
  fire_monthly_comfort: z.number().min(0),
  fire_monthly_luxury: z.number().min(0),
  withdrawal_rate: z.number().min(0.02).max(0.06),
  post_fire_part_time_income_monthly: z.number().min(0).optional(),
  safety_buffer_multiplier: z.number().min(1.0).max(1.5).optional(),
  include_stable_income_offset: z.boolean().optional()
});
export type FormData = z.infer<typeof schema>;

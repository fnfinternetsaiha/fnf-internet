export const SAIHA_VENGS = [
  'New Saiha East',
  'New Saiha West',
  'Old Saiha',
  'College Veng',
  'Meisatla',
  'Council Veng',
  'Bazar Veng',
  'Siahatla I',
  'Siahatla II',
  'ECM Veng',
  'Tisopi',
  'Noaotla',
  'Thiahra',
] as const;

export type SaihaVeng = typeof SAIHA_VENGS[number];

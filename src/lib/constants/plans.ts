export interface InternetPlan {
  id: string;
  name: string;
  speed_mbps: number;
  price: number;
  validity_days: number;
}

export const INTERNET_PLANS: InternetPlan[] = [
  { id: 'fnf-30', name: 'FNF Starter 30M', speed_mbps: 30, price: 499, validity_days: 30 },
  { id: 'fnf-50', name: 'FNF Standard 50M', speed_mbps: 50, price: 699, validity_days: 30 },
  { id: 'fnf-100', name: 'FNF Turbo 100M', speed_mbps: 100, price: 999, validity_days: 30 },
  { id: 'fnf-200', name: 'FNF Ultra 200M', speed_mbps: 200, price: 1499, validity_days: 30 },
];

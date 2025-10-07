import { useQuery } from '@tanstack/react-query';
import { api } from './client';
import { mockTenants, mockAccounts, generateMockCostSeries, mockBudgets, mockAnomalies, mockRecommendations, mockReports } from './mock-data';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export const useTenants = () =>
  useQuery({ 
    queryKey: ['tenants'], 
    queryFn: async () => {
      if (USE_MOCK) return mockTenants;
      return (await api.get('/tenants')).data;
    }
  });

export const useAccounts = (tenantId: string) =>
  useQuery({ 
    queryKey: ['accounts', tenantId], 
    queryFn: async () => {
      if (USE_MOCK) return mockAccounts;
      return (await api.get(`/tenants/${tenantId}/accounts`)).data;
    }
  });

export const useCostSeries = (params: { tenantId: string; from: string; to: string }) =>
  useQuery({ 
    queryKey: ['costs', 'series', params], 
    queryFn: async () => {
      if (USE_MOCK) return generateMockCostSeries(30);
      return (await api.get('/costs/series', { params })).data;
    }
  });

export const useBudgets = (tenantId: string) =>
  useQuery({ 
    queryKey: ['budgets', tenantId], 
    queryFn: async () => {
      if (USE_MOCK) return mockBudgets;
      return (await api.get(`/tenants/${tenantId}/budgets`)).data;
    }
  });

export const useAnomalies = (tenantId: string) =>
  useQuery({ 
    queryKey: ['anomalies', tenantId], 
    queryFn: async () => {
      if (USE_MOCK) return mockAnomalies;
      return (await api.get(`/tenants/${tenantId}/anomalies`)).data;
    }
  });

export const useRecommendations = (tenantId: string) =>
  useQuery({ 
    queryKey: ['recommendations', tenantId], 
    queryFn: async () => {
      if (USE_MOCK) return mockRecommendations;
      return (await api.get(`/tenants/${tenantId}/recommendations`)).data;
    }
  });

export const useReports = (tenantId: string) =>
  useQuery({ 
    queryKey: ['reports', tenantId], 
    queryFn: async () => {
      if (USE_MOCK) return mockReports;
      return (await api.get(`/tenants/${tenantId}/reports`)).data;
    }
  });


import { useState, useEffect } from 'react';
import { api } from '../../../services/api';

export interface DashboardMetrics {
  month: string;
  dateRange: string;
  revenue: { value: number; status: 'green' | 'yellow' | 'red' };
  ticket: { value: number; status: 'green' | 'yellow' | 'red' };
  orders: { value: number; status: 'green' | 'yellow' | 'red' };
  users: number;
}

export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await api.get<DashboardMetrics>('/dashboard/resumo-mensal');

        setMetrics(response.data);
        setError(null); 

      } catch (err: any) {
        console.error("Erro ao buscar KPIs:", err);
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { metrics, loading, error };
};
import { useState, useEffect } from 'react';
import { api } from '../../../services/api';

export interface MonthlySalesData {
  totalVendido: number;
  metaMensal: number;
}

export const useMonthlySales = () => {
  const [data, setData] = useState<MonthlySalesData>({ totalVendido: 0, metaMensal: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/vendas-meta');
      
      const dadosBackend = response.data;
      
      setData({
        totalVendido: dadosBackend.revenue?.value || 0, 
        metaMensal: dadosBackend.meta?.value || 0
      });

      setError(null);
    } catch (err: any) {
      console.error("Erro ao buscar vendas:", err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const atualizarMeta = async (novaMeta: number): Promise<boolean> => {
    try {
      await api.post('/dashboard/atualizar-meta', { meta: novaMeta });
      setData(prev => ({ ...prev, metaMensal: novaMeta }));
      return true;
    } catch (err: any) {
      console.error("Erro ao atualizar meta:", err);
      setError(err.message || 'Erro ao atualizar meta');
      return false;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, atualizarMeta, refetch: fetchData };
};

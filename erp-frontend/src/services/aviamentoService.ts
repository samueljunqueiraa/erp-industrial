import { api } from './api';

export interface AviamentoDTO {
  id: number;
  nome: string;
  codigoReferencia: string;
  tipo: 'BOTAO' | 'LINHA' | 'ZIPER' | 'ETIQUETA' | 'OUTROS';
}

export const aviamentoService = {
  getByTipo: async (tipo: string): Promise<AviamentoDTO[]> => {
    const token = localStorage.getItem('erp_token');
    const response = await api.get<AviamentoDTO[]>(`/aviamentos/tipo/${tipo}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
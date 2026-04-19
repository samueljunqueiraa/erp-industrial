import { api } from './api';
import { type OrdemCorteDTO } from './ordemService'; 

export const producaoService = {
  
  listarOrdensFocoProducao: async (status?: string): Promise<OrdemCorteDTO[]> => {
    const params = status ? { status } : {};
    const response = await api.get<OrdemCorteDTO[]>('/producao/ordens', { params });
    return response.data;
  },

  avancarFase: async (id: number, novoStatus: string, usuarioResponsavel: string, observacao: string) => {
    const response = await api.post(`/producao/ordem-corte/${id}/avancar`, {
      novoStatus,
      usuarioResponsavel,
      observacao
    });
    return response.data;
  }
};
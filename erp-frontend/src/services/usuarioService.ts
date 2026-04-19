import { api } from './api';

export interface Usuario {
  id?: number;
  nomeCompleto: string;
  email: string;
  senha?: string; 
  papel: 'ADMIN' | 'GERENTE_FABRIL' | 'GERENTE_VENDAS' | 'EXPEDICAO' | 'OPERADOR' | 'VENDEDOR';
  ativo: boolean;
}

export const usuarioService = {
  // Buscar todos
  getAll: async (): Promise<Usuario[]> => {
    const token = localStorage.getItem('erp_token');
    const response = await api.get<Usuario[]>('/usuarios', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Criar novo
  create: async (usuario: Usuario): Promise<Usuario> => {
    const token = localStorage.getItem('erp_token');
    const response = await api.post<Usuario>('/usuarios', usuario, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }, 

  // Edita
  update: async (id: number, usuario: Usuario): Promise<Usuario> => {
    const token = localStorage.getItem('erp_token');
    const response = await api.put<Usuario>(`/usuarios/${id}`, usuario, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
import {api} from './api';

export interface ClienteDTO {
  id?: number; 
  nome: string; 
  nomeFantasia: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  celular?: string;
  cep: string;
  endereco: string;
  numero?: string;
  bairro: string;
  municipio: string;       
  estado: string;       
  inscricaoEstadual?: string;
}

export const clienteService = {
    listar: async () => {
        return clienteService.getAll();
    },

    getAll: async () => {
        const token = localStorage.getItem('erp_token');
        const { data } = await api.get('/clientes', {
             headers: { Authorization: `Bearer ${token}` }
        });
        return data;
    },
    
  getById: async (id: number): Promise<ClienteDTO> => {
    const token = localStorage.getItem('erp_token');
    const response = await api.get<ClienteDTO>(`/clientes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  search: async (termo: string): Promise<ClienteDTO[]> => {
    const token = localStorage.getItem('erp_token');
    const response = await api.get<ClienteDTO[]>(`/clientes/buscar?termo=${termo}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  create: async (data: ClienteDTO): Promise<ClienteDTO> => {
    const token = localStorage.getItem('erp_token');
    const response = await api.post<ClienteDTO>('/clientes', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  update: async (id: number, data: ClienteDTO): Promise<ClienteDTO> => {
    const token = localStorage.getItem('erp_token');
    const response = await api.put<ClienteDTO>(`/clientes/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    const token = localStorage.getItem('erp_token');
    await api.delete(`/clientes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};
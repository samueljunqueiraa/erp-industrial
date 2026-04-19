import { api } from './api';

export interface ProdutoDTO {
  id?: number;
  nome: string;
  referenciaBase: string;
  descricao: string;
  tecidoId: number;
  categoriaId: number;
  corId: number;
  precoBase: number;
  ativo: boolean;
  imagemUrl?: string;
  nomeTecido?: string;
  nomeCategoria?: string;
}

export interface EstoqueGradeDTO {
    [tamanho: string]: {
        fisico: number;
        producao: number;
    };
}

export interface ProdutoBuscaDTO {
    id: number;
    nome: string;
    referenciaBase?: string; 
    precoBase: number;
    referencia?: string; 
    corId?: number;     
    nomeCor?: string;  
    cor?: { id: number; nome: string }; 
    imagemUrl?: string;
}

export interface TecidoDTO { id: number; nome: string; }
export interface CategoriaDTO { id: number; nome: string; }
export interface CorDTO { id: number; nome: string; }

export const produtoService = {
  
  getAll: async (): Promise<ProdutoDTO[]> => {
    const response = await api.get<ProdutoDTO[]>('/produtos');
    return response.data;
  },

  getById: async (id: number): Promise<ProdutoDTO> => {
    const response = await api.get<ProdutoDTO>(`/produtos/${id}`);
    return response.data;
  },

  create: async (data: ProdutoDTO): Promise<ProdutoDTO> => {
    const response = await api.post<ProdutoDTO>('/produtos', data);
    return response.data;
  },

  update: async (id: number, data: ProdutoDTO): Promise<ProdutoDTO> => {
    const response = await api.put<ProdutoDTO>(`/produtos/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/produtos/${id}`);
  },

  // --- RECURSOS ---
  getTecidos: async (): Promise<TecidoDTO[]> => {
    const response = await api.get<TecidoDTO[]>('/recursos/tecidos');
    return response.data;
  },

  getCategorias: async (): Promise<CategoriaDTO[]> => {
    const response = await api.get<CategoriaDTO[]>('/recursos/categorias');
    return response.data;
  },

  getCores: async (): Promise<CorDTO[]> => {
    const response = await api.get<CorDTO[]>('/recursos/cores');
    return response.data;
  },

  buscar: async (termo: string): Promise<ProdutoBuscaDTO[]> => {
      const { data } = await api.get<ProdutoBuscaDTO[]>('/produtos/buscar', { 
          params: { termo } 
      });
      return data;
  },

  consultarEstoqueGrade: async (produtoId: number, corId: number): Promise<EstoqueGradeDTO> => {
      const { data } = await api.get<EstoqueGradeDTO>(`/estoque/grade`, { 
          params: { produtoId, corId }
      });
      return data;
  },
  
  exportarPdfDisponibilidade: async (termo: string): Promise<Blob> => {
      const response = await api.get('/estoque/exportar-pdf', { 
          params: { termo },
          responseType: 'blob' 
      });
      return response.data;
  }
};

export interface ContaReceberDTO {
  id: number;
  cliente: string;
  documento: string;
  dataVencimento: string;
  valorTotal: number;
  valorAberto: number;
  status: 'ABERTO' | 'ATRASADO' | 'RECEBIDO';
}

export interface RealizarBaixaDTO {
  contaId: number;
  dataPagamento: string;
  formaPagamento: string;
  comprovante: File; 
}

export const financeiroService = {
  
  listarContas: async (status?: string, busca?: string): Promise<ContaReceberDTO[]> => {
    const { data } = await api.get<ContaReceberDTO[]>('/financeiro/contas-receber', {
      params: { 
        status: status !== 'TODOS' ? status : undefined, 
        termo: busca || undefined 
      }
    });
    return data;
  },

  avancarFase: async (id: number, novoStatus: string, usuarioResponsavel: string, observacao: string) => {
    const { data } = await api.post(`/producao/ordem-corte/${id}/avancar`, {
        novoStatus,
        usuarioResponsavel,
        observacao
    });
    return data;
  },

  baixarConta: async (dadosBaixa: RealizarBaixaDTO): Promise<void> => {
    const formData = new FormData();
    formData.append('contaId', String(dadosBaixa.contaId));
    formData.append('dataPagamento', dadosBaixa.dataPagamento);
    formData.append('formaPagamento', dadosBaixa.formaPagamento);
    formData.append('comprovante', dadosBaixa.comprovante); // Anexa o PDF/Imagem

    await api.post('/financeiro/contas-receber/baixa', formData, {
      headers: {
        'Content-Type': 'multipart/form-data' // Avisa o Java que tem arquivo indo
      }
    });
  }
};
import { api } from './api';

// --- INTERFACES ---

export interface BipagemRequest {
  codigoBarras: string;
  ordemId: number | null; 
}

export interface BipagemResponse {
  status: string;
  nomeProduto: string;
  qtdConferida: number; 
  qtdTotal: number;     
  novoSaldoEstoque: number;
}

export interface ConferenciaPedidoDTO {
  pedidoId: number;
  numeroPedido: string;
  nomeCliente: string;
  nomeVendedor?: string;
  dataPedido?: string;  
  totalItens: number;
  itensConferidos: number;
  status: string;
  itens: ItemConferenciaDTO[];
}

export interface ItemEstoqueDTO {
    sku: string;
    produto: string;
    ordem: string;       
    planejado: number;   
    conferido: number;   
    saldo: number;
}

export interface ItemConferenciaDTO {
  sku: string;
  nomeProduto: string;
  codigoBarras: string;
  qtdPedida: number;
  qtdConferida: number; 
  conferidoCompleto: boolean;
}

export interface OrdemResumo {
  id: number;
  codigoOrdem: string;
  dataEmissao?: string | number[]; 
  dataCriacao: string | number[];
  status: string;
}

export const expedicaoService = {

  listarOrdens: async (): Promise<OrdemResumo[]> => {
    const token = localStorage.getItem('erp_token');
    const response = await api.get<OrdemResumo[]>('/ordens', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  biparEntrada: async (dados: BipagemRequest): Promise<BipagemResponse> => {
    const token = localStorage.getItem('erp_token');
    const response = await api.post<BipagemResponse>('/expedicao/recebimento/bipar', dados, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  listarEstoque: async (): Promise<ItemEstoqueDTO[]> => {
    const token = localStorage.getItem('erp_token');
    const response = await api.get<ItemEstoqueDTO[]>('/expedicao/estoque', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // --- CORREÇÃO AQUI: A URL deve ser igual ao Java ---
  listarPedidosPendentes: async (): Promise<ConferenciaPedidoDTO[]> => {
    const token = localStorage.getItem('erp_token');
    // URL CORRETA: /expedicao/pedidos-pendentes
    const response = await api.get<ConferenciaPedidoDTO[]>('/expedicao/pedidos-pendentes', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // --- CORREÇÃO AQUI: URL e Body corretos ---
  conferirItemPedido: async (pedidoId: number, codigoBarras: string): Promise<void> => {
    const token = localStorage.getItem('erp_token');
    // URL CORRETA: /expedicao/pedido/{id}/conferir
    // BODY: { codigoBarras: "..." }
    await api.post(`/expedicao/pedido/${pedidoId}/conferir`, 
      { codigoBarras },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
};
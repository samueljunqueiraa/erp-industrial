import { api } from './api';
export interface PedidoListDTO {
    id: number;
    clienteId?: number; 
    vendedorId?: number;
    dataCriacao: string;    
    total: number;        
    status: string;
}

export interface PedidoResponse {
    id: number;
    status: string;
    valorTotal: number;
}

export const vendaService = {
    
    // Listar vendas
    listar: async () => {
    const response = await api.get('/pedidos');
    return response.data;
    },

    // 1. Listar todos (Para a tela PedidoList.tsx)
    getAll: async (): Promise<PedidoListDTO[]> => {
        const { data } = await api.get<PedidoListDTO[]>('/pedidos');
        return data;
    },

    create: async (pedidoCompleto: any): Promise<PedidoResponse> => {
        const { data } = await api.post<PedidoResponse>('/pedidos', pedidoCompleto);
        return data;
    },

    iniciarVenda: async (clienteNome: string): Promise<PedidoResponse> => {
        const { data } = await api.post<PedidoResponse>('/pedidos/iniciar', { nomeCliente: clienteNome });
        return data;
    },

    // Adiciona item
    adicionarItem: async (pedidoId: number, sku: string, quantidade: number) => {
        return await api.post(`/pedidos/${pedidoId}/adicionar`, { sku, quantidade });
    },

    // Finaliza
    finalizarVenda: async (pedidoId: number) => {
        return await api.post(`/pedidos/${pedidoId}/finalizar`);
    },

    // --- PDF ---
    downloadPdf: async (pedidoId: number) => {
        const response = await api.get(`/pedidos/${pedidoId}/pdf`, { 
            responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `pedido_${pedidoId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
};
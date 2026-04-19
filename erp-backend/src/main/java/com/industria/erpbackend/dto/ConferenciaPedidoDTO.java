package com.industria.erpbackend.dto;

import java.util.ArrayList;
import java.util.List;

public class ConferenciaPedidoDTO {

    private Long pedidoId;
    private String numeroPedido;
    private String nomeCliente;
    private String nomeVendedor;
    private String dataPedido;
    private Integer totalItens;
    private Integer itensConferidos;
    private String status;
    private List<ItemDTO> itens = new ArrayList<>();

    public ConferenciaPedidoDTO() {
    }

    public ConferenciaPedidoDTO(Long pedidoId, String numeroPedido, String nomeCliente,
                                Integer totalItens, Integer itensConferidos, String status,
                                List<ItemDTO> itens) {
        this.pedidoId = pedidoId;
        this.numeroPedido = numeroPedido;
        this.nomeCliente = nomeCliente;
        this.totalItens = totalItens;
        this.itensConferidos = itensConferidos;
        this.status = status;
        this.itens = itens != null ? itens : new ArrayList<>();
    }

    // --- GETTERS E SETTERS ---

    public Long getPedidoId() { return pedidoId; }
    public void setPedidoId(Long pedidoId) { this.pedidoId = pedidoId; }

    public String getNumeroPedido() { return numeroPedido; }
    public void setNumeroPedido(String numeroPedido) { this.numeroPedido = numeroPedido; }

    public String getNomeCliente() { return nomeCliente; }
    public void setNomeCliente(String nomeCliente) { this.nomeCliente = nomeCliente; }

    public String getNomeVendedor() { return nomeVendedor; }
    public void setNomeVendedor(String nomeVendedor) { this.nomeVendedor = nomeVendedor; }

    public String getDataPedido() { return dataPedido; }
    public void setDataPedido(String dataPedido) { this.dataPedido = dataPedido; }

    public Integer getTotalItens() { return totalItens; }
    public void setTotalItens(Integer totalItens) { this.totalItens = totalItens; }

    public Integer getItensConferidos() { return itensConferidos; }
    public void setItensConferidos(Integer itensConferidos) { this.itensConferidos = itensConferidos; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<ItemDTO> getItens() { return itens; }
    public void setItens(List<ItemDTO> itens) { this.itens = itens != null ? itens : new ArrayList<>(); }

    public static class ItemDTO {
        private String sku;
        private String nomeProduto;
        private String codigoBarras;
        private Integer quantidadePedida;
        private Integer quantidadeConferida;
        private boolean conferidoCompleto; 

        public ItemDTO() {
        }

        public ItemDTO(String sku, String nomeProduto, String codigoBarras,
                       Integer quantidadePedida, Integer quantidadeConferida) {
            this.sku = sku;
            this.nomeProduto = nomeProduto;
            this.codigoBarras = codigoBarras;
            this.quantidadePedida = quantidadePedida;
            this.quantidadeConferida = quantidadeConferida;
        }

        public String getSku() { return sku; }
        public void setSku(String sku) { this.sku = sku; }

        public String getNomeProduto() { return nomeProduto; }
        public void setNomeProduto(String nomeProduto) { this.nomeProduto = nomeProduto; }

        public String getCodigoBarras() { return codigoBarras; }
        public void setCodigoBarras(String codigoBarras) { this.codigoBarras = codigoBarras; }

        public Integer getQuantidadePedida() { return quantidadePedida; }
        public void setQuantidadePedida(Integer quantidadePedida) { this.quantidadePedida = quantidadePedida; }

        public Integer getQuantidadeConferida() { return quantidadeConferida; }
        public void setQuantidadeConferida(Integer quantidadeConferida) { this.quantidadeConferida = quantidadeConferida; }

        public void setQtdPedida(Integer qtd) {
            this.quantidadePedida = qtd;
        }

        public void setQtdConferida(Integer qtd) {
            this.quantidadeConferida = qtd;
        }

        public boolean isConferidoCompleto() {
            return conferidoCompleto;
        }

        public void setConferidoCompleto(boolean conferidoCompleto) {
            this.conferidoCompleto = conferidoCompleto;
        }
    }
}
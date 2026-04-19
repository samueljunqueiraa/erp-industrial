package com.industria.erpbackend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;

@Entity
@Table(name = "tb_item_pedido")
public class ItemPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pedido_id")
    @JsonIgnore
    private Pedido pedido;

    @ManyToOne
    @JoinColumn(name = "sku_id")
    private Sku sku;

    private Integer quantidade;

    @Column(name = "preco_unitario")
    private BigDecimal precoUnitario;

    @Column(name = "subtotal")
    private BigDecimal subtotal;
    
    @Column(name = "preco_total")
    private BigDecimal precoTotal;
    
    @Column(name = "qtd_conferida")
    private Integer quantidadeConferida;
    
    public ItemPedido() {
    }

    public ItemPedido(Pedido pedido, Sku sku, Integer quantidade, BigDecimal precoUnitario) {
        this.pedido = pedido;
        this.sku = sku;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario;
        if (precoUnitario != null && quantidade != null) {
            this.subtotal = precoUnitario.multiply(new BigDecimal(quantidade));
        }
    }

    // --- MÉTODOS AUXILIARES PARA O PDF (Transient) ---
    @Transient
    public BigDecimal getTotalItem() {
        return this.subtotal != null ? this.subtotal : BigDecimal.ZERO;
    }
    // --- GETTERS E SETTERS PADRÃO ---

    public Long getId() { 
        return id; 
    }
    public void setId(Long id) { 
        this.id = id; 
    }
    public Pedido getPedido() { 
        return pedido; 
    }
    public void setPedido(Pedido pedido) { 
        this.pedido = pedido; 
    }
    public Sku getSku() { 
        return sku; 
    }
    public void setSku(Sku sku) { 
        this.sku = sku; 
    }
    public Integer getQuantidade() {
        return quantidade; 
    }
    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade; 
    }
    public BigDecimal getPrecoUnitario() { 
        return precoUnitario; 
    }
    public void setPrecoUnitario(BigDecimal precoUnitario) { 
        this.precoUnitario = precoUnitario; 
    }
    public BigDecimal getSubtotal() { 
        return subtotal; 
    }
    public void setSubtotal(BigDecimal subtotal) { 
        this.subtotal = subtotal; 
    }
    public BigDecimal getPrecoTotal() {
        return precoTotal;
    }

    public void setPrecoTotal(BigDecimal precoTotal) {
        this.precoTotal = precoTotal;
    }

    public Integer getQuantidadeConferida() {
        return quantidadeConferida != null ? quantidadeConferida : 0;
    }

    public void setQuantidadeConferida(Integer quantidadeConferida) {
        this.quantidadeConferida = quantidadeConferida;
    }
}
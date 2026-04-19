package com.industria.erpbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_movimentacao_estoque")
public class MovimentacaoEstoque {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "sku_id") 
    private Sku sku;
    
    @Column(name = "quantidade") 
    private Integer quantidade;
    
    @Column(name = "tipo_movimento") // 'ENTRADA' ou 'SAIDA'
    private String tipoMovimento;

    @Column(name = "motivo") // 'VENDA', 'AJUSTE', etc
    private String motivo;

    @Column(name = "documento_referencia") // 'Pedido #123'
    private String documentoReferencia;

    @Column(name = "data_movimentacao") 
    private LocalDateTime dataMovimentacao;
    
    @Column(name = "ordem_corte_id")
    private Long ordemCorteId; 
    
    @Column(name = "origem_movimento")
    private String origemMovimento; 

    // --- GETTERS E SETTERS ---
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Sku getSku() { return sku; }
    public void setSku(Sku sku) { this.sku = sku; }

    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }

    public String getTipoMovimento() { return tipoMovimento; }
    public void setTipoMovimento(String tipoMovimento) { this.tipoMovimento = tipoMovimento; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public String getDocumentoReferencia() { return documentoReferencia; }
    public void setDocumentoReferencia(String documentoReferencia) { this.documentoReferencia = documentoReferencia; }

    public LocalDateTime getDataMovimentacao() { return dataMovimentacao; }
    public void setDataMovimentacao(LocalDateTime dataMovimentacao) { this.dataMovimentacao = dataMovimentacao; }

    public Long getOrdemCorteId() { return ordemCorteId; }
    public void setOrdemCorteId(Long ordemCorteId) { this.ordemCorteId = ordemCorteId; }

    public String getOrigemMovimento() { return origemMovimento; }
    public void setOrigemMovimento(String origemMovimento) { this.origemMovimento = origemMovimento; }
}
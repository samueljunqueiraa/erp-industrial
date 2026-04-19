package com.industria.erpbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal;
import com.industria.erpbackend.enums.StatusPedido;

@Entity
@Table(name = "tb_pedido")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_pedido")
    private String numeroPedido;

    @Column(name = "cliente_id")
    private Long clienteId;

    @Column(name = "vendedor_id")
    private Long vendedorId;

    @Column(name = "transportadora_id")
    private Long transportadoraId;

    @Column(name = "usuario_autorizou_desconto_id")
    private Long usuarioAutorizouDescontoId;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;
    
    @Column(name = "data_finalizacao") 
    private LocalDateTime dataFinalizacao;

    @Column(name = "tipo_frete")
    private String tipoFrete;

    // --- VALORES MONETÁRIOS (BigDecimal) ---
    @Column(name = "valor_frete")
    private BigDecimal valorFrete = BigDecimal.ZERO;

    @Column(name = "subtotal")
    private BigDecimal subtotal = BigDecimal.ZERO;
    
    @Column(name = "valor_total")
    private BigDecimal valorTotal;

    @Column(name = "desconto_aplicado")
    private BigDecimal descontoAplicado = BigDecimal.ZERO;
    
    @Column(name = "observacoes_nota", columnDefinition = "TEXT")
    private String observacoesNota;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private StatusPedido status;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedido> itens = new ArrayList<>();

    // =================================================================
    // GETTERS E SETTERS 
    // =================================================================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNumeroPedido() { return numeroPedido; }
    public void setNumeroPedido(String numeroPedido) { this.numeroPedido = numeroPedido; }

    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }

    public Long getVendedorId() { return vendedorId; }
    public void setVendedorId(Long vendedorId) { this.vendedorId = vendedorId; }

    public Long getTransportadoraId() { return transportadoraId; }
    public void setTransportadoraId(Long transportadoraId) { this.transportadoraId = transportadoraId; }

    public Long getUsuarioAutorizouDescontoId() { return usuarioAutorizouDescontoId; }
    public void setUsuarioAutorizouDescontoId(Long usuarioAutorizouDescontoId) { this.usuarioAutorizouDescontoId = usuarioAutorizouDescontoId; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }
    
    public LocalDateTime getDataFinalizacao() { return dataFinalizacao; }
    public void setDataFinalizacao(LocalDateTime dataFinalizacao) { this.dataFinalizacao = dataFinalizacao; }

    public String getTipoFrete() { return tipoFrete; }
    public void setTipoFrete(String tipoFrete) { this.tipoFrete = tipoFrete; }

    public BigDecimal getValorFrete() { return valorFrete; }
    public void setValorFrete(BigDecimal valorFrete) { this.valorFrete = valorFrete; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getDescontoAplicado() { return descontoAplicado; }
    public void setDescontoAplicado(BigDecimal descontoAplicado) { this.descontoAplicado = descontoAplicado; }

    public String getObservacoesNota() { return observacoesNota; }
    public void setObservacoesNota(String observacoesNota) { this.observacoesNota = observacoesNota; }

    public StatusPedido getStatus() { return status; }
    public void setStatus(StatusPedido status) { this.status = status; }

    public List<ItemPedido> getItens() { return itens; }
    public void setItens(List<ItemPedido> itens) { this.itens = itens; }
    
    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }

	// --- MÉTODOS AUXILIARES PARA O PDF (Transient) ---
    public LocalDateTime getDataEmissao() {
        return this.dataCriacao;
    }

    // O PDF pede getCliente e getVendedor como objetos completos.
    // Calcula o total do pedido somando subtotal + frete - desconto
    public BigDecimal getTotal() {
        BigDecimal total = this.subtotal != null ? this.subtotal : BigDecimal.ZERO;
        
        if (this.valorFrete != null) {
            total = total.add(this.valorFrete);
        }
        if (this.descontoAplicado != null) {
            total = total.subtract(this.descontoAplicado);
        }
        return total;
    }
}
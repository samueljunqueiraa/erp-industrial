package com.industria.erpbackend.entity;

import com.industria.erpbackend.enums.StatusOrdem;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_historico_ordem_corte")
public class HistoricoOrdemCorte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordem_id", nullable = false)
    private OrdemCorte ordemCorte;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_anterior")
    private StatusOrdem statusAnterior;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_novo", nullable = false)
    private StatusOrdem statusNovo;

    @Column(name = "data_hora_movimento", nullable = false)
    private LocalDateTime dataHoraMovimento;

    @Column(name = "usuario_responsavel")
    private String usuarioResponsavel;

    @Column(name = "observacao", columnDefinition = "TEXT")
    private String observacao;

    // --- GETTERS E SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public OrdemCorte getOrdemCorte() { return ordemCorte; }
    public void setOrdemCorte(OrdemCorte ordemCorte) { this.ordemCorte = ordemCorte; }

    public StatusOrdem getStatusAnterior() { return statusAnterior; }
    public void setStatusAnterior(StatusOrdem statusAnterior) { this.statusAnterior = statusAnterior; }

    public StatusOrdem getStatusNovo() { return statusNovo; }
    public void setStatusNovo(StatusOrdem statusNovo) { this.statusNovo = statusNovo; }

    public LocalDateTime getDataHoraMovimento() { return dataHoraMovimento; }
    public void setDataHoraMovimento(LocalDateTime dataHoraMovimento) { this.dataHoraMovimento = dataHoraMovimento; }

    public String getUsuarioResponsavel() { return usuarioResponsavel; }
    public void setUsuarioResponsavel(String usuarioResponsavel) { this.usuarioResponsavel = usuarioResponsavel; }

    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}
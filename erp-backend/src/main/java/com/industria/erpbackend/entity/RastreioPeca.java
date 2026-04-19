package com.industria.erpbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_rastreio_peca")
public class RastreioPeca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_unico", unique = true, nullable = false)
    private String codigoUnico; // Ex: P-1-C-1-T-11.1050.35

    @ManyToOne
    @JoinColumn(name = "ordem_corte_id")
    private OrdemCorte ordemCorte;

    @ManyToOne
    @JoinColumn(name = "sku_id")
    private Sku sku;

    @Column(name = "status")
    private String status; // 'EM_ESTOQUE', 'VENDIDO'

    @Column(name = "data_entrada")
    private LocalDateTime dataEntrada;

    @Column(name = "data_saida")
    private LocalDateTime dataSaida;

    // --- CONSTRUTORES ---
    public RastreioPeca() {}

    // --- GETTERS E SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodigoUnico() { return codigoUnico; }
    public void setCodigoUnico(String codigoUnico) { this.codigoUnico = codigoUnico; }

    public OrdemCorte getOrdemCorte() { return ordemCorte; }
    public void setOrdemCorte(OrdemCorte ordemCorte) { this.ordemCorte = ordemCorte; }

    public Sku getSku() { return sku; }
    public void setSku(Sku sku) { this.sku = sku; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getDataEntrada() { return dataEntrada; }
    public void setDataEntrada(LocalDateTime dataEntrada) { this.dataEntrada = dataEntrada; }

    public LocalDateTime getDataSaida() { return dataSaida; }
    public void setDataSaida(LocalDateTime dataSaida) { this.dataSaida = dataSaida; }
}
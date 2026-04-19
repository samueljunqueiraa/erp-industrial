package com.industria.erpbackend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "tb_item_ordem_corte")
public class ItemOrdemCorte {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ordem_id", nullable = false)
    @JsonIgnore
    private OrdemCorte ordemCorte;

    @ManyToOne
    @JoinColumn(name = "tamanho_id", nullable = false)
    private Tamanho tamanho;

    // 1. O que o PCP mandou cortar
    @Column(name = "qtd_planejada", nullable = false)
    private Integer qtdPlanejada;

    // 2. O que a fábrica realmente entregou (pode ser menor que o planejado)
    @Column(name = "qtd_produzida")
    private Integer qtdProduzida = 0;

    // 3. O que o Almoxarifado bipou e guardou
    @Column(name = "qtd_conferida")
    private Integer qtdConferida = 0; 

    // --- GETTERS E SETTERS MANUAIS ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public OrdemCorte getOrdemCorte() { return ordemCorte; }
    public void setOrdemCorte(OrdemCorte ordemCorte) { this.ordemCorte = ordemCorte; }

    public Tamanho getTamanho() { return tamanho; }
    public void setTamanho(Tamanho tamanho) { this.tamanho = tamanho; }

    public Integer getQtdPlanejada() { return qtdPlanejada; }
    public void setQtdPlanejada(Integer qtdPlanejada) { this.qtdPlanejada = qtdPlanejada; }

    public Integer getQtdProduzida() { return qtdProduzida; }
    public void setQtdProduzida(Integer qtdProduzida) { this.qtdProduzida = qtdProduzida; }

    public Integer getQtdConferida() { return qtdConferida; }
    public void setQtdConferida(Integer qtdConferida) { this.qtdConferida = qtdConferida; }
}
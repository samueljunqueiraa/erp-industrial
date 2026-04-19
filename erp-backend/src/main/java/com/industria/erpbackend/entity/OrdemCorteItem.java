package com.industria.erpbackend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "tb_item_ordem_corte")
public class OrdemCorteItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ordem_id", nullable = false)
    @JsonIgnore
    private OrdemCorte ordemCorte;

    @ManyToOne
    @JoinColumn(name = "tamanho_id", nullable = false)
    private Tamanho tamanho;

    // --- AS 3 COLUNAS ---
    @Column(name = "qtd_planejada", nullable = false)
    private Integer qtdPlanejada;

    @Column(name = "qtd_produzida")
    private Integer qtdProduzida = 0;

    @Column(name = "qtd_conferida")
    private Integer qtdConferida = 0; 

    // --- CONSTRUTOR VAZIO (Obrigatório para o JPA/Hibernate funcionar) ---
    public OrdemCorteItem() {
    }

    // --- CONSTRUTOR QUE RESOLVE O ERRO DA LINHA 61 ---
    public OrdemCorteItem(Tamanho tamanho, Integer qtd, OrdemCorte ordemCorte) {
        this.tamanho = tamanho;
        this.qtdPlanejada = qtd; // Mapeia o 'qtd' que vem do parametro para 'qtdPlanejada'
        this.ordemCorte = ordemCorte;
        this.qtdProduzida = 0;
        this.qtdConferida = 0;
    }

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
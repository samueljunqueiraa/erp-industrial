package com.industria.erpbackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tb_estoque_saldo")
public class EstoqueSaldo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "sku_id")
    private Long skuId;
    
    @Column(name = "qtd_reservada")
    private Integer qtdReservada = 0;
    
    private Integer qtdFisica;
    private String localizacao;

    // --- GETTERS E SETTERS MANUAIS ---
    public Long getId() { 
    	return id; 
    }
    public void setId(Long id) { 
    	this.id = id; 
    }

    public Long getSkuId() { 
    	return skuId; 
    }
    public void setSkuId(Long skuId) { 
    	this.skuId = skuId; 
    }

    public Integer getQtdFisica() {
    	return qtdFisica; 
    }
    public void setQtdFisica(Integer qtdFisica) { 
    	this.qtdFisica = qtdFisica; 
    }

    public Integer getQtdReservada() { 
    	return qtdReservada; 
    }
    public void setQtdReservada(Integer qtdReservada) { 
    	this.qtdReservada = qtdReservada; 
    }

    public String getLocalizacao() {
    	return localizacao; 
    }
    public void setLocalizacao(String localizacao) { 
    	this.localizacao = localizacao; 
    }
}

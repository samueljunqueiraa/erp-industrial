package com.industria.erpbackend.entity;

import com.industria.erpbackend.enums.TipoAviamento;
import jakarta.persistence.*;

@Entity
@Table(name = "tb_aviamento")
public class Aviamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nome;
    
    @Column(name = "codigo_referencia")
    private String codigoReferencia;

    @Enumerated(EnumType.STRING)
    private TipoAviamento tipo;

    private Boolean ativo = true;

    // Getters e Setters
    public Integer getId() { 
    	return id; 
    }
    public void setId(Integer id) { 
    	this.id = id; 
    }
    public String getNome() { 
    	return nome; 
    }
    public void setNome(String nome) { 
    	this.nome = nome; 
    }
    public String getCodigoReferencia() { 
    	return codigoReferencia; 
    }
    public void setCodigoReferencia(String codigoReferencia) {
    	this.codigoReferencia = codigoReferencia; 
    }
    public TipoAviamento getTipo() { 
    	return tipo; 
    }
    public void setTipo(TipoAviamento tipo) {
    	this.tipo = tipo; 
    }
    public Boolean getAtivo() { 
    	return ativo; 
    }
    public void setAtivo(Boolean ativo) { 
    	this.ativo = ativo; 
    }
}
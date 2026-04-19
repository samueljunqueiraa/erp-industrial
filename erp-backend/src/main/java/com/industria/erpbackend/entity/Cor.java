package com.industria.erpbackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tb_cor")
public class Cor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // Integer para evitar aquele erro de tipo

    private String nome;

    public Cor() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
}

package com.industria.erpbackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tb_tecido")
public class Tecido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // <--- MUDAR DE Long PARA Integer

    private String nome;

    public Tecido() {}

    public Integer getId() { return id; } // <--- Ajustar Getter
    public void setId(Integer id) { this.id = id; } // <--- Ajustar Setter
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
}
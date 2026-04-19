package com.industria.erpbackend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*; // Import das validações
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- REGRAS DE VALIDAÇÃO APLICADAS ---

    @NotBlank(message = "A Razão Social é obrigatória")
    @Size(min = 3, max = 150, message = "O nome deve ter entre 3 e 150 caracteres")
    private String nome; // Razão Social
    
    @Column(name = "data_cadastro", updatable = false)
    @CreationTimestamp
    private LocalDateTime dataCadastro;

    @Size(max = 150, message = "O nome fantasia deve ter no máximo 150 caracteres")
    @Column(name = "nome_fantasia")
    private String nomeFantasia;

    @NotBlank(message = "O CPF/CNPJ é obrigatório")
    // O Regex abaixo aceita EXATAMENTE 11 dígitos (CPF) OU 14 dígitos (CNPJ)
    @Pattern(regexp = "\\d{11}|\\d{14}", message = "O documento deve conter apenas números: 11 (CPF) ou 14 (CNPJ)")
    @Column(name = "cpf_cnpj", nullable = false, unique = true) // unique=true impede duplicidade no banco
    private String cpfCnpj;

    @Email(message = "O e-mail informado não é válido")
    private String email;

    @Size(max = 11, message = "O telefone deve ter no máximo 11 dígitos")
    private String telefone;

    @Size(max = 11, message = "O celular deve ter no máximo 11 dígitos")
    private String celular;

    // Endereço (Geralmente obrigatórios para emissão de Nota Fiscal)
    @NotBlank(message = "O CEP é obrigatório")
    @Size(max = 9, message = "O CEP deve ter no máximo 9 caracteres")
    private String cep;

    @NotBlank(message = "O endereço é obrigatório")
    private String endereco;

    @NotBlank(message = "O bairro é obrigatório")
    private String bairro;

    @NotBlank(message = "O município é obrigatório")
    private String municipio;

    @NotBlank(message = "O estado (UF) é obrigatório")
    @Size(min = 2, max = 2, message = "O estado deve ser a sigla (ex: MG)")
    private String estado;

    @Column(name = "historico_compras")
    private String historicoCompras;
    
    @Column(name = "condicao_pagamento")
    private String condPagamento;

    public Cliente() {}

    // --- GETTERS E SETTERS (Mantidos iguais) ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getNomeFantasia() { return nomeFantasia; }
    public void setNomeFantasia(String nomeFantasia) { this.nomeFantasia = nomeFantasia; }

    public String getCpfCnpj() { return cpfCnpj; }
    public void setCpfCnpj(String cpfCnpj) { this.cpfCnpj = cpfCnpj; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getCelular() { return celular; }
    public void setCelular(String celular) { this.celular = celular; }

    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }

    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }

    public String getBairro() { return bairro; }
    public void setBairro(String bairro) { this.bairro = bairro; }

    public String getMunicipio() { return municipio; }
    public void setMunicipio(String municipio) { this.municipio = municipio; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getHistoricoCompras() { return historicoCompras; }
    public void setHistoricoCompras(String historicoCompras) { this.historicoCompras = historicoCompras; }
    
    public String getCondPagamento() { return condPagamento; }
    public void setCondPagamento(String condPagamento) { this.condPagamento = condPagamento; }
    
    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }
    
}
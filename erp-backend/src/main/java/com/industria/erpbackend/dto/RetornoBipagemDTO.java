package com.industria.erpbackend.dto;

public class RetornoBipagemDTO {
    
    private String status;
    private String nomeProduto;
    
    // Nomes abreviados para bater com sua interface React
    private Integer qtdConferida; 
    private Integer qtdTotal;
    
    private Integer novoSaldoEstoque;

    public RetornoBipagemDTO(String status, String nomeProduto, Integer qtdConferida, Integer qtdTotal, Integer novoSaldoEstoque) {
        this.status = status;
        this.nomeProduto = nomeProduto;
        this.qtdConferida = qtdConferida;
        this.qtdTotal = qtdTotal;
        this.novoSaldoEstoque = novoSaldoEstoque;
    }

    // Getters são obrigatórios para o JSON ser gerado
    public String getStatus() { return status; }
    public String getNomeProduto() { return nomeProduto; }
    public Integer getQtdConferida() { return qtdConferida; }
    public Integer getQtdTotal() { return qtdTotal; }
    public Integer getNovoSaldoEstoque() { return novoSaldoEstoque; }
}
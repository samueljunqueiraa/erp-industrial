package com.industria.erpbackend.dto;

import java.time.LocalDate;
import java.util.List;

public class OrdemCorteDTO {
    
	private Long id;
    private Long produtoId;
    private String status;
    private String produtoNome;
    private String produtoReferencia;
    private Integer quantidadeTotal;
    private String numeroLote;
    private LocalDate dataEmissao;
    private String codigoOrdem;
    private LocalDate dataCriacao;
    private String botaoCodigo;
    private String linhaCor;
    private String zipperCor;
    private String observacao;
    private String produtoCor;
    private String produtoTecido;
    private String produtoCategoria;
    private String produtoImagemUrl;
    private Integer produtoCorId;
    
    // Lista da grade (ex: [{tamanhoId: 1, quantidade: 100}, ...])
    private List<ItemGradeDTO> grade;

    // Getters e Setters
    
    public Long getId() {
    	return id; 
    }
    public void setId(Long id) {
    	this.id = id; 
    }
    
    public Long getProdutoId() { 
    	return produtoId; 
    }
    
    public String getNumeroLote() { return numeroLote; }
    public void setNumeroLote(String numeroLote) { this.numeroLote = numeroLote; }
    
    public LocalDate getDataEmissao() { return dataEmissao; }
    public void setDataEmissao(LocalDate dataEmissao) { this.dataEmissao = dataEmissao; }
    
    public String getCodigoOrdem() { 
    	return codigoOrdem; 
    }
    public void setCodigoOrdem(String codigoOrdem) { 
    	this.codigoOrdem = codigoOrdem; 
    }

    public LocalDate getDataCriacao() { 
    	return dataCriacao; 
    }
    public void setDataCriacao(LocalDate dataCriacao) { 
    	this.dataCriacao = dataCriacao;
    }
    
    public void setProdutoId(Long produtoId) { 
    	this.produtoId = produtoId; 
    }

    public String getBotaoCodigo() { 
    	return botaoCodigo; 
    }
    public void setBotaoCodigo(String botaoCodigo) { 
    	this.botaoCodigo = botaoCodigo; 
    }

    public String getLinhaCor() { 
    	return linhaCor; 
    }
    public void setLinhaCor(String linhaCor) { 
    	this.linhaCor = linhaCor; 
    }

    public String getZipperCor() { 
    	return zipperCor; 
    }
    public void setZipperCor(String zipperCor) { 
    	this.zipperCor = zipperCor; 
    }

    public String getObservacao() { 
    	return observacao; 
    }
    public void setObservacao(String observacao) { 
    	this.observacao = observacao; 
    }
    
    public String getStatus() { 
    	return status; 
    }
    public void setStatus(String status) { 
    	this.status = status; 
    }
    
    public String getProdutoNome() { 
    	return produtoNome; 
    }
    public void setProdutoNome(String produtoNome) { 
    	this.produtoNome = produtoNome; 
    }
    
    public String getProdutoReferencia() { 
    	return produtoReferencia; 
    }
    public void setProdutoReferencia(String produtoReferencia) { 
    	this.produtoReferencia = produtoReferencia; 
    }
    
    public Integer getQuantidadeTotal() { 
    	return quantidadeTotal; 
    }
    public void setQuantidadeTotal(Integer quantidadeTotal) { 
    	this.quantidadeTotal = quantidadeTotal; 
    }
    
    public String getProdutoCor() {
        return produtoCor;
    }

    public void setProdutoCor(String produtoCor) {
        this.produtoCor = produtoCor;
    }

    public String getProdutoTecido() {
        return produtoTecido;
    }

    public void setProdutoTecido(String produtoTecido) {
        this.produtoTecido = produtoTecido;
    }

    public String getProdutoCategoria() {
        return produtoCategoria;
    }

    public void setProdutoCategoria(String produtoCategoria) {
        this.produtoCategoria = produtoCategoria;
    }
    
    public String getProdutoImagemUrl() { 
    	return produtoImagemUrl; 
    }
    public void setProdutoImagemUrl(String produtoImagemUrl) { 
    	this.produtoImagemUrl = produtoImagemUrl; 
    }
    
    public Integer getProdutoCorId() { 
    	return produtoCorId; 
    }
    public void setProdutoCorId(Integer produtoCorId) { 
    	this.produtoCorId = produtoCorId; 
    }

    public List<ItemGradeDTO> getGrade() { 
    	return grade; 
    }
    public void setGrade(List<ItemGradeDTO> grade) { 
    	this.grade = grade; 
    }

    // --- CLASSE INTERNA PARA OS ITENS ---
    public static class ItemGradeDTO {
        public Integer tamanhoId;
        public Integer quantidade;
    }
}
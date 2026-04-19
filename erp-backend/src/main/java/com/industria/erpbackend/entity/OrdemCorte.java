package com.industria.erpbackend.entity;

import com.industria.erpbackend.enums.StatusOrdem;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tb_ordem_corte")
public class OrdemCorte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- COLUNAS QUE VOCÊ LISTOU ---
    
    @Column(name = "numero_lote")
    private String numeroLote;

    @Column(name = "codigo_ordem") 
    private String codigoOrdem; 

    @Column(name = "data_emissao")
    private LocalDate dataEmissao;

    @Column(name = "data_criacao")
    private LocalDate dataCriacao;

    @Column(name = "data_previsao")
    private LocalDate dataPrevisao;

    @Column(name = "quantidade_total")
    private Integer quantidadeTotal; 

    @Enumerated(EnumType.STRING)
    private StatusOrdem status = StatusOrdem.PLANEJADA;

    @Column(name = "observacao", columnDefinition = "TEXT")
    private String observacao;

    // --- RELACIONAMENTOS ---
    @ManyToOne
    @JoinColumn(name = "produto_id")
    private Produto produto;

    @Column(name = "botao_codigo")
    private String botaoCodigo;

    @Column(name = "linha_cor")
    private String linhaCor;

    @Column(name = "zipper_cor")
    private String zipperCor;

    @OneToMany(mappedBy = "ordemCorte", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrdemCorteItem> itens = new ArrayList<>();

    public void adicionarItemGrade(Tamanho tam, Integer qtd) {
        OrdemCorteItem item = new OrdemCorteItem(tam, qtd, this);
        this.itens.add(item);
    }

    // --- GETTERS E SETTERS  ---
    
    public Long getId() { 
    	return id; 
    }
    public void setId(Long id) { 
    	this.id = id; 
    }

    public String getNumeroLote() { 
    	return numeroLote; 
    }
    public void setNumeroLote(String numeroLote) { 
    	this.numeroLote = numeroLote; 
    }

    public String getCodigoOrdem() { 
    	return codigoOrdem; 
    }
    public void setCodigoOrdem(String codigoOrdem) { 
    	this.codigoOrdem = codigoOrdem; 
    }

    public LocalDate getDataEmissao() { 
    	return dataEmissao; 
    }
    public void setDataEmissao(LocalDate dataEmissao) { 
    	this.dataEmissao = dataEmissao; 
    }

    public LocalDate getDataCriacao() { 
    	return dataCriacao; 
    }
    public void setDataCriacao(LocalDate dataCriacao) {
    	this.dataCriacao = dataCriacao; 
    }

    public Integer getQuantidadeTotal() { 
    	return quantidadeTotal; 
    }
    public void setQuantidadeTotal(Integer quantidadeTotal) { 
    	this.quantidadeTotal = quantidadeTotal; 
    }
    
    public Produto getProduto() {
    	return produto; 
    }
    public void setProduto(Produto produto) { 
    	this.produto = produto; 
    }
    
    public StatusOrdem getStatus() { 
    	return status; 
    }
    public void setStatus(StatusOrdem status) { 
    	this.status = status; 
    }
    
    public String getObservacao() { 
    	return observacao; 
    }
    public void setObservacao(String observacao) { 
    	this.observacao = observacao; 
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
    
    public List<OrdemCorteItem> getItens() { 
    	return itens; 
    }
    public void setItens(List<OrdemCorteItem> itens) { 
    	this.itens = itens; 
    }
}
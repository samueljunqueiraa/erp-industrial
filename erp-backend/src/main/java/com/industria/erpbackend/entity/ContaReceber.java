package com.industria.erpbackend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "contas_receber")
public class ContaReceber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cliente;
    private String documento; // Ex: NF-123, PED-001
    
    private LocalDate dataVencimento;
    private BigDecimal valorTotal;
    
    // Status pode ser: ABERTO, ATRASADO, RECEBIDO
    private String status; 

    // --- DADOS DA BAIXA (Preenchidos apenas quando pago) ---
    private LocalDate dataPagamento;
    private String formaPagamento;
    
    // Caminho onde o PDF/Imagem foi salvo no servidor
    private String caminhoComprovante; 

    // Getters e Setters...
    public Long getId() { 
    	return id; 
    }
    
    public void setId(Long id) { 
    	this.id = id; 
    }

    public String getCliente() { 
    	return cliente; 
    }
    
    public void setCliente(String cliente) { 
    	this.cliente = cliente; 
    }

    public String getDocumento() { 
    	return documento; 
    }
    
    public void setDocumento(String documento) { 
    	this.documento = documento; 
    }

    public LocalDate getDataVencimento() { 
    	return dataVencimento; 
    }
    
    public void setDataVencimento(LocalDate dataVencimento) { 
    	this.dataVencimento = dataVencimento; 
    }

    public BigDecimal getValorTotal() { 
    	return valorTotal; 
    }
    
    public void setValorTotal(BigDecimal valorTotal) { 
    	this.valorTotal = valorTotal; 
    }

    public String getStatus() { 
    	return status; 
    }
    
    public void setStatus(String status) { 
    	this.status = status; 
    }

    public LocalDate getDataPagamento() { 
    	return dataPagamento; 
    }
    
    public void setDataPagamento(LocalDate dataPagamento) { 
    	this.dataPagamento = dataPagamento; 
    }

    public String getFormaPagamento() { 
    	return formaPagamento; 
    }
    
    public void setFormaPagamento(String formaPagamento) { 
    	this.formaPagamento = formaPagamento; 
    }

    public String getCaminhoComprovante() { 
    	return caminhoComprovante; 
    }
    public void setCaminhoComprovante(String caminhoComprovante) { 
    	this.caminhoComprovante = caminhoComprovante; 
    }
}
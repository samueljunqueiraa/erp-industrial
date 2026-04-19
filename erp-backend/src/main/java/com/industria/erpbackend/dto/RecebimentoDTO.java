package com.industria.erpbackend.dto;

// import lombok.Data; // Pode apagar essa linha se não for usar
// @Data // Pode apagar essa linha

public class RecebimentoDTO {
    
    private String codigoBarras;
    private Long ordemId;

    // --- GETTERS E SETTERS MANUAIS ---

    public String getCodigoBarras() {
        return codigoBarras;
    }

    public void setCodigoBarras(String codigoBarras) {
        this.codigoBarras = codigoBarras;
    }

    public Long getOrdemId() {
        return ordemId;
    }

    public void setOrdemId(Long ordemId) {
        this.ordemId = ordemId;
    }
}
package com.industria.erpbackend.dto;

import java.math.BigDecimal;

public class VendasMetaDTO {
    private BigDecimal totalVendido;
    private BigDecimal metaMensal;

    public VendasMetaDTO() {}
    public VendasMetaDTO(BigDecimal totalVendido, BigDecimal metaMensal) {
        this.totalVendido = totalVendido;
        this.metaMensal = metaMensal;
    }

    public BigDecimal getTotalVendido() { return totalVendido; }
    public void setTotalVendido(BigDecimal totalVendido) { this.totalVendido = totalVendido; }
    public BigDecimal getMetaMensal() { return metaMensal; }
    public void setMetaMensal(BigDecimal metaMensal) { this.metaMensal = metaMensal; }
}

package com.industria.erpbackend.dto;

import java.math.BigDecimal;

public class MetaRequest {
    private BigDecimal meta;

    public MetaRequest() {}

    public MetaRequest(BigDecimal meta) {
        this.meta = meta;
    }

    public BigDecimal getMeta() {
        return meta;
    }

    public void setMeta(BigDecimal meta) {
        this.meta = meta;
    }
}

package com.industria.erpbackend.enums;

public enum TipoMovimentacao {
    ENTRADA_PRODUCAO, // Vindo da Ordem de Corte
    SAIDA_VENDA,      // Vindo do Pedido
    AJUSTE_BALANCO,   // Correção manual
    DEVOLUCAO_CLIENTE
}
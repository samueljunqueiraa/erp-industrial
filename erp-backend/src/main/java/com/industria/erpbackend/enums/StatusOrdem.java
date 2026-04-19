package com.industria.erpbackend.enums;

public enum StatusOrdem {
	PLANEJADA,           // PCP criou, mas não desceu pra fábrica
    EM_CORTE,            // Gerente apertou "Iniciar Corte"
    COSTURA_INICIAL,     // Partes sendo montadas separadamente
    FECHAMENTO,          // Juntando o terno
    CONTROLE_QUALIDADE,  // QA inspecionando o lote
    AGUARDANDO_ESTOQUE,  // QA aprovou, esperando o almoxarifado bipar (qtdConferida)
    FINALIZADA,          // Bipagem concluída (Pronta Entrega)
    CANCELADA
}
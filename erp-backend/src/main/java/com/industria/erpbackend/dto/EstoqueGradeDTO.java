package com.industria.erpbackend.dto;

import java.util.HashMap;

// Funciona como um Map: { "44": { "fisico": 10, "producao": 0 }, "46": ... }
public class EstoqueGradeDTO extends HashMap<String, EstoqueGradeDTO.DadosEstoque> {

    // Método auxiliar para facilitar adicionar dados
    public void add(String tamanho, int fisico, int producao) {
        this.put(tamanho, new DadosEstoque(fisico, producao));
    }

    public static class DadosEstoque {
        public int fisico;
        public int producao;

        public DadosEstoque(int fisico, int producao) {
            this.fisico = fisico;
            this.producao = producao;
        }
    }
}
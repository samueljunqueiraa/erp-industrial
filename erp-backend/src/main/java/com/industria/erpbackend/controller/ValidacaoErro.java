package com.industria.erpbackend.controller;

import java.util.ArrayList;
import java.util.List;

public class ValidacaoErro {
    private int status;
    private String mensagem;
    private List<String> erros = new ArrayList<>();

    public ValidacaoErro(int status, String mensagem) {
        this.status = status;
        this.mensagem = mensagem;
    }

    public void addErro(String erro) {
        this.erros.add(erro);
    }

    public int getStatus() { return status; }
    public String getMensagem() { return mensagem; }
    public List<String> getErros() { return erros; }
}
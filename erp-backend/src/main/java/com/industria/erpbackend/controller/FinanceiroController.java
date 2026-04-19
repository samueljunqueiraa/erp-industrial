package com.industria.erpbackend.controller;

import com.industria.erpbackend.entity.ContaReceber;
import com.industria.erpbackend.service.FinanceiroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/financeiro/contas-receber")
public class FinanceiroController {

    @Autowired
    private FinanceiroService service;

    // Rota GET para listar as contas (usado na tabela)
    @GetMapping
    public ResponseEntity<List<ContaReceber>> listarContas(
            @RequestParam(required = false, defaultValue = "TODOS") String status,
            @RequestParam(required = false, defaultValue = "") String termo) {
        
        List<ContaReceber> contas = service.listarContas(status, termo);
        return ResponseEntity.ok(contas);
    }

    // Rota POST para receber o formulário com o arquivo de comprovante
    @PostMapping(value = "/baixa", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> baixarConta(
            @RequestParam("contaId") Long contaId,
            @RequestParam("dataPagamento") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataPagamento,
            @RequestParam("formaPagamento") String formaPagamento,
            @RequestParam("comprovante") MultipartFile comprovante) {

        try {
            service.processarBaixa(contaId, dataPagamento, formaPagamento, comprovante);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao processar baixa: " + e.getMessage());
        }
    }
}
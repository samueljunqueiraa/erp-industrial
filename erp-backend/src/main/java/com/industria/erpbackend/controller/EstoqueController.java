package com.industria.erpbackend.controller;

import com.industria.erpbackend.dto.EstoqueGradeDTO;
import com.industria.erpbackend.service.EstoqueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/estoque")
@CrossOrigin("*") // Garante que o Front consiga acessar
public class EstoqueController {

    @Autowired
    private EstoqueService service;

    @GetMapping("/grade")
    public ResponseEntity<EstoqueGradeDTO> consultarGrade(
            @RequestParam Long produtoId,
            @RequestParam Long corId
    ) {
        return ResponseEntity.ok(service.consultarGrade(produtoId, corId));
    }
    
    @GetMapping(value = "/exportar-pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exportarGradePdf(@RequestParam(required = false, defaultValue = "") String termo) {
        
        byte[] pdfBytes = service.exportarGradePdf(termo);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        // Sugere o nome do arquivo para download
        headers.setContentDispositionFormData("attachment", "Disponibilidade_Grade.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
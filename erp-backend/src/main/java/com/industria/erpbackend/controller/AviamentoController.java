package com.industria.erpbackend.controller;

import com.industria.erpbackend.entity.Aviamento;
import com.industria.erpbackend.enums.TipoAviamento;
import com.industria.erpbackend.repository.AviamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aviamentos")
@CrossOrigin("*")
public class AviamentoController {

    @Autowired
    private AviamentoRepository repository;

    @GetMapping
    public List<Aviamento> listarTodos() {
        return repository.findAll();
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Aviamento>> listarPorTipo(@PathVariable TipoAviamento tipo) {
        return ResponseEntity.ok(repository.findByTipo(tipo));
    }
    
    @PostMapping
    public Aviamento criar(@RequestBody Aviamento aviamento) {
        return repository.save(aviamento);
    }
}
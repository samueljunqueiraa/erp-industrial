package com.industria.erpbackend.controller;

import com.industria.erpbackend.entity.Categoria;
import com.industria.erpbackend.entity.Cor;
import com.industria.erpbackend.entity.Tecido;
import com.industria.erpbackend.repository.CategoriaRepository;
import com.industria.erpbackend.repository.CorRepository;
import com.industria.erpbackend.repository.TecidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin; // <--- IMPORTANTE
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recursos")
@CrossOrigin("*") // <--- ADICIONE ISSO AQUI PARA LIBERAR O REACT
public class RecursosController {

    @Autowired
    private TecidoRepository tecidoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;
    
    @Autowired
    private CorRepository corRepository;

    @GetMapping("/tecidos")
    public ResponseEntity<List<Tecido>> listarTecidos() {
        return ResponseEntity.ok(tecidoRepository.findAll());
    }

    @GetMapping("/categorias")
    public ResponseEntity<List<Categoria>> listarCategorias() {
        return ResponseEntity.ok(categoriaRepository.findAll());
    }
    
    @GetMapping("/cores")
    public ResponseEntity<List<Cor>> listarCores() {
        return ResponseEntity.ok(corRepository.findAll());
    }
}
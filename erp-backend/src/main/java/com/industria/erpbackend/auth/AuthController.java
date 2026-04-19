package com.industria.erpbackend.auth;

import com.industria.erpbackend.dto.UsuarioLoginDTO;
import com.industria.erpbackend.entity.Usuario;
import com.industria.erpbackend.repository.UsuarioRepository;
import com.industria.erpbackend.service.TokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository repository; // Usa o Repositório de Entidade
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthController(UsuarioRepository repository, PasswordEncoder passwordEncoder, TokenService tokenService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody UsuarioLoginDTO data) {
        // 1. Busca o usuário no banco pelo EMAIL
        Optional<Usuario> userOpt = repository.findByEmail(data.getEmail());

        if (userOpt.isPresent()) {
            Usuario usuario = userOpt.get();
            
            // 2. Verifica se a senha bate (Senha crua vs Hash no banco)
            if (passwordEncoder.matches(data.getSenha(), usuario.getSenhaHash())) {
                
                // 3. Converte para o objeto de segurança e gera o token
                UsuarioSistema usuarioSeguranca = new UsuarioSistema(usuario);
                String token = tokenService.generateToken(usuarioSeguranca);
                
                return ResponseEntity.ok(new LoginResponseDTO(token));
            }
        }

        return ResponseEntity.status(401).build();
    }
    
    // DTO de Resposta simples
    public record LoginResponseDTO(String token) {}
}
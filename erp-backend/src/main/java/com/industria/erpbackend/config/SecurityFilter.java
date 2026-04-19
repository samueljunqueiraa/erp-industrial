package com.industria.erpbackend.config;

import com.industria.erpbackend.entity.Usuario;
import com.industria.erpbackend.repository.UsuarioRepository;
import com.industria.erpbackend.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    TokenService tokenService;

    @Autowired
    UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        var token = this.recoverToken(request);

        if (token != null) {
            // O validateToken devolve o "subject", que no nosso caso é o EMAIL
            var email = tokenService.validateToken(token);

            if (!email.isEmpty()) {
                // CORREÇÃO 1: O método no Repositório é 'findByEmail', não 'findByLogin'
                Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);

                if (usuario != null) {
                    // CORREÇÃO 2: O campo de permissão é 'papel' (Enum), não 'grupo'
                    // Adicionamos "ROLE_" antes para o Spring Security entender
                    var authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + usuario.getPapel().name()));

                    // CORREÇÃO 3: Criamos o UserDetails usando os campos corretos da Entidade
                    // getEmail() ao invés de getLogin()
                    // getSenhaHash() ao invés de getSenha()
                    UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                            usuario.getEmail(),
                            usuario.getSenhaHash(),
                            authorities
                    );

                    // Autentica no contexto da requisição
                    var authentication = new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }
        filterChain.doFilter(request, response);
    }

    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null) return null;
        return authHeader.replace("Bearer ", "");
    }
}
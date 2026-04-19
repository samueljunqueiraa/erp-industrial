package com.industria.erpbackend.auth;

import com.industria.erpbackend.entity.Usuario; // Sua entidade do banco
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UsuarioSistema implements UserDetails {

    private final Usuario usuario;

    public UsuarioSistema(Usuario usuario) {
        this.usuario = usuario;
    }

    public Usuario getUsuarioOriginal() {
        return usuario;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Converte o ENUM do banco (ADMIN, VENDEDOR) para a Authority do Spring
        return List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getPapel().name()));
    }

    @Override
    public String getPassword() {
        return usuario.getSenhaHash();
    }

    @Override
    public String getUsername() {
        return usuario.getEmail(); // O login é o email
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return usuario.getAtivo(); }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return usuario.getAtivo(); }
}

package com.industria.erpbackend.dto;

public class UsuarioResponseDTO {

    private String email;
    private String papel; // Vamos devolver o papel (ADMIN, VENDEDOR) como String

    public UsuarioResponseDTO() {
    }

    public UsuarioResponseDTO(String email, String papel) {
        this.email = email;
        this.papel = papel;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPapel() {
        return papel;
    }

    public void setPapel(String papel) {
        this.papel = papel;
    }
}
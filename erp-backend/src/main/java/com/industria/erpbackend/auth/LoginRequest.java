package com.industria.erpbackend.auth;

/**
 * DTO simples (record) para requisição de login.
 */
public record LoginRequest(String username, String password) {
}

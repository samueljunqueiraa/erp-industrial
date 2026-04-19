package com.industria.erpbackend.auth;

import com.industria.erpbackend.entity.PapelUsuario;
import com.industria.erpbackend.entity.Usuario;
import com.industria.erpbackend.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AuthDataInitializer implements CommandLineRunner {

    // USA O REPOSITÓRIO REAL (DO BANCO)
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthDataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Verifica se a tabela tb_usuario está vazia
        if (usuarioRepository.count() == 0) {
            Usuario admin = new Usuario();
            
            // Preenche os dados da ENTIDADE (tb_usuario)
            admin.setNomeCompleto("Administrador do Sistema");
            admin.setEmail("admin@splindid.com"); // O Login será este email
            admin.setSenhaHash(passwordEncoder.encode("123456")); // Senha criptografada
            admin.setPapel(PapelUsuario.ADMIN);
            admin.setAtivo(true);

            usuarioRepository.save(admin);
            System.out.println("✅ USUÁRIO ADMIN CRIADO: admin@splindid.com / 123456");
        } else {
            System.out.println("ℹ️ O banco já possui usuários.");
        }
    }
}
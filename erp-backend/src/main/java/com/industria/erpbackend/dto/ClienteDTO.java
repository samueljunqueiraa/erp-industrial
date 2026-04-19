package com.industria.erpbackend.dto;

import com.industria.erpbackend.entity.Cliente;
import jakarta.validation.constraints.*;

public record ClienteDTO(
    Long id,
    
    @NotBlank(message = "A Razão Social é obrigatória")
    @Size(min = 3, max = 150, message = "O nome deve ter entre 3 e 150 caracteres")
    String nome,
    
    @Size(max = 150)
    String nomeFantasia,
    
    @NotBlank(message = "O CPF/CNPJ é obrigatório")
    @Pattern(regexp = "\\d{11}|\\d{14}", message = "O documento deve ter 11 ou 14 dígitos numéricos")
    String cpfCnpj,
    
    @Email(message = "E-mail inválido")
    String email,
    
    String telefone,
    String celular,
    String cep,
    String endereco,
    String bairro,
    String municipio,
    String estado,
    String condPagamento
) {
    
	public ClienteDTO(Cliente entity) {
        this(
            entity.getId(),
            entity.getNome(),
            entity.getNomeFantasia(),
            entity.getCpfCnpj(),
            entity.getEmail(),
            entity.getTelefone(),
            entity.getCelular(),
            entity.getCep(),
            entity.getEndereco(),
            entity.getBairro(),
            entity.getMunicipio(),
            entity.getEstado(),
            entity.getHistoricoCompras()
        );
    }
}
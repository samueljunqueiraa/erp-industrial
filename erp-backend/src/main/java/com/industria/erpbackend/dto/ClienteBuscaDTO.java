package com.industria.erpbackend.dto;


import com.industria.erpbackend.entity.Cliente;

public record ClienteBuscaDTO(
        String id,
        String nomeCliente,      // Exibe Nome Fantasia (Prioridade) ou Razão
        String razaoSocial,      // Exibe Razão Social (Fiscal)
        String cnpj,
        String enderecoEntrega,
        String bairro,
        String cep,
        String municipio,
        String estado,
        String telefone,
        String celular,
        String email1,
        Long vendedorResponsavelId
) {

    public ClienteBuscaDTO(Cliente cliente) {
        this(
            String.valueOf(cliente.getId()),
            
            // LÓGICA DE EXIBIÇÃO:
            // Se tiver Fantasia, usa ele. Se não, usa a Razão Social.
            (cliente.getNomeFantasia() != null && !cliente.getNomeFantasia().isBlank()) 
                ? cliente.getNomeFantasia() 
                : cliente.getNome(),
            cliente.getNome(), // Razão Social sempre aqui
            cliente.getCpfCnpj(),
            cliente.getEndereco(),
            cliente.getBairro(),
            cliente.getCep(),
            cliente.getMunicipio(),
            cliente.getEstado(),
            cliente.getTelefone(),
            cliente.getCelular(),
            cliente.getEmail(),
            null
        );
    }
}
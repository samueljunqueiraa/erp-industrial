package com.industria.erpbackend.service;

import com.industria.erpbackend.dto.ClienteDTO;
import com.industria.erpbackend.entity.Cliente;
import com.industria.erpbackend.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository repository;

    @Transactional(readOnly = true)
    public List<ClienteDTO> findAll() {
        // Busca tudo no banco e converte cada Cliente para ClienteDTO
        return repository.findAll().stream().map(ClienteDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public ClienteDTO findById(Long id) {
        Optional<Cliente> obj = repository.findById(id);
        // Se achar, retorna o DTO. Se não, retorna null (ideal seria lançar exceção)
        return obj.map(ClienteDTO::new).orElse(null); 
    }

    @Transactional
    public ClienteDTO insert(ClienteDTO dto) {
        Cliente entity = new Cliente();
        copyDtoToEntity(dto, entity);
        entity = repository.save(entity);
        return new ClienteDTO(entity);
    }

    @Transactional
    public ClienteDTO update(Long id, ClienteDTO dto) {
        Optional<Cliente> obj = repository.findById(id);
        if (obj.isPresent()) {
            Cliente entity = obj.get();
            copyDtoToEntity(dto, entity); 
            entity = repository.save(entity);
            return new ClienteDTO(entity);
        }
        return null;
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    // Método auxiliar para copiar os dados do DTO para a Entidade
    private void copyDtoToEntity(ClienteDTO dto, Cliente entity) {
        entity.setNome(dto.nome());
        entity.setNomeFantasia(dto.nomeFantasia());
        entity.setCpfCnpj(dto.cpfCnpj());
        entity.setEmail(dto.email());
        entity.setTelefone(dto.telefone());
        entity.setCelular(dto.celular());
        entity.setCep(dto.cep());
        entity.setEndereco(dto.endereco());
        entity.setBairro(dto.bairro());
        entity.setMunicipio(dto.municipio());
        entity.setEstado(dto.estado());
        entity.setCondPagamento(dto.condPagamento());
    }
}
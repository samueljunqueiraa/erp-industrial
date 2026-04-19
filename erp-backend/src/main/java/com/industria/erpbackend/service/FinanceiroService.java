package com.industria.erpbackend.service;

import com.industria.erpbackend.entity.ContaReceber;
import com.industria.erpbackend.repository.ContaReceberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
@Service
public class FinanceiroService {

    @Autowired
    private ContaReceberRepository repository;

    // Pasta onde os comprovantes serão salvos (cria na raiz do projeto)
    private final String PASTA_COMPROVANTES = "comprovantes_upload/";

    public List<ContaReceber> listarContas(String status, String termo) {
        // Trata os filtros que vieram do React
        String statusFilter = (status == null || status.equals("TODOS")) ? null : status;
        String termoFilter = (termo == null || termo.trim().isEmpty()) ? null : termo;
        
        return repository.buscarComFiltros(statusFilter, termoFilter);
    }

    @Transactional
    public void processarBaixa(Long contaId, LocalDate dataPagamento, String formaPagamento, MultipartFile comprovante) throws IOException {
        
        ContaReceber conta = repository.findById(contaId)
                .orElseThrow(() -> new RuntimeException("Conta não encontrada."));

        if ("RECEBIDO".equals(conta.getStatus())) {
            throw new RuntimeException("Esta conta já foi baixada anteriormente.");
        }

        // 1. Salva o Arquivo Fisicamente
        String caminhoArquivo = salvarArquivo(comprovante, conta.getDocumento());

        // 2. Atualiza a Entidade
        conta.setDataPagamento(dataPagamento);
        conta.setFormaPagamento(formaPagamento);
        conta.setCaminhoComprovante(caminhoArquivo);
        conta.setStatus("RECEBIDO");

        // 3. Salva no banco
        repository.save(conta);
    }

    // Método auxiliar para salvar o arquivo no disco
    private String salvarArquivo(MultipartFile arquivo, String documento) throws IOException {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new IllegalArgumentException("Comprovante é obrigatório.");
        }

        // Cria a pasta se não existir
        File diretorio = new File(PASTA_COMPROVANTES);
        if (!diretorio.exists()) {
            diretorio.mkdirs();
        }

        // Gera um nome único para não sobrescrever arquivos com mesmo nome
        String extensao = arquivo.getOriginalFilename().substring(arquivo.getOriginalFilename().lastIndexOf("."));
        String nomeUnico = documento + "_" + UUID.randomUUID().toString().substring(0, 8) + extensao;
        
        Path caminhoCompleto = Paths.get(PASTA_COMPROVANTES + nomeUnico);
        Files.write(caminhoCompleto, arquivo.getBytes());

        return caminhoCompleto.toString();
    }
    
    
}

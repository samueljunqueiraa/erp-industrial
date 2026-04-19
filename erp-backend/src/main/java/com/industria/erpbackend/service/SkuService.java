package com.industria.erpbackend.service;

import com.industria.erpbackend.entity.Sku;
import com.industria.erpbackend.repository.SkuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class SkuService {

    @Autowired private SkuRepository skuRepository;

    @Transactional
    public Sku garantirSku(Long produtoId, Integer corId, Integer tamanhoId, String codigoBarras) {
        
        Optional<Sku> existente = skuRepository.findByCodigoBarras(codigoBarras);
        
        if (existente.isPresent()) {
            return existente.get();
        }

        Sku novoSku = new Sku();
        novoSku.setProdutoId(produtoId);
        novoSku.setCorId(corId);
        novoSku.setTamanhoId(tamanhoId);
        novoSku.setCodigoBarras(codigoBarras);
        return skuRepository.save(novoSku);
    }
}
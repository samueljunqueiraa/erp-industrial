package com.industria.erpbackend.repository;

import com.industria.erpbackend.entity.Aviamento;
import com.industria.erpbackend.enums.TipoAviamento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AviamentoRepository extends JpaRepository<Aviamento, Integer> {
    List<Aviamento> findByTipo(TipoAviamento tipo);
}

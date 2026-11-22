package com.brian.ecommerce.repository;

import com.brian.ecommerce.entity.Attribute;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttributeRepository
        extends JpaRepository<Attribute, Long> {

    List<Attribute> findByGroupIdOrderBySortOrderAscIdAsc(Long groupId);

    boolean existsByGroupIdAndCodeIgnoreCase(Long groupId, String code);
}
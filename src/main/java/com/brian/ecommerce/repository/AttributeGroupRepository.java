package com.brian.ecommerce.repository;

import com.brian.ecommerce.entity.AttributeGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttributeGroupRepository
        extends JpaRepository<AttributeGroup, Long> {

    List<AttributeGroup> findAllByOrderBySortOrderAscIdAsc();

    boolean existsByNameIgnoreCase(String name);
}
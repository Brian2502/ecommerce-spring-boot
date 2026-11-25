
package com.brian.ecommerce.repository;

import com.brian.ecommerce.entity.CategoryAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryAttributeRepository
        extends JpaRepository<CategoryAttribute, Long> {

    List<CategoryAttribute> findByCategoryId(Long categoryId);

    boolean existsByCategoryIdAndAttributeId(
            Long categoryId,
            Long attributeId
    );

    void deleteByCategoryIdAndAttributeId(
            Long categoryId,
            Long attributeId
    );
}

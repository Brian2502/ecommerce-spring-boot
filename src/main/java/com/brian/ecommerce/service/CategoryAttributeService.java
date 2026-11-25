
package com.brian.ecommerce.service;

import com.brian.ecommerce.entity.Attribute;
import com.brian.ecommerce.entity.Category;
import com.brian.ecommerce.entity.CategoryAttribute;
import com.brian.ecommerce.repository.AttributeRepository;
import com.brian.ecommerce.repository.CategoryAttributeRepository;
import com.brian.ecommerce.repository.CategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CategoryAttributeService {

    private final CategoryRepository categoryRepository;
    private final AttributeRepository attributeRepository;
    private final CategoryAttributeRepository categoryAttributeRepository;

    public CategoryAttributeService(
            CategoryRepository categoryRepository,
            AttributeRepository attributeRepository,
            CategoryAttributeRepository categoryAttributeRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.attributeRepository = attributeRepository;
        this.categoryAttributeRepository = categoryAttributeRepository;
    }

    @Transactional(readOnly = true)
    public List<Attribute> getAttributes(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Category not found"
            );
        }

        return categoryAttributeRepository.findByCategoryId(categoryId)
                .stream()
                .map(CategoryAttribute::getAttribute)
                .toList();
    }

    @Transactional
    public void addAttribute(Long categoryId, Long attributeId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Category not found"
                ));

        Attribute attribute = attributeRepository.findById(attributeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Attribute not found"
                ));

        if (categoryAttributeRepository.existsByCategoryIdAndAttributeId(
                categoryId, attributeId
        )) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Attribute already assigned to category"
            );
        }

        CategoryAttribute categoryAttribute = new CategoryAttribute();
        categoryAttribute.setCategory(category);
        categoryAttribute.setAttribute(attribute);

        categoryAttributeRepository.save(categoryAttribute);
    }

    @Transactional
    public void removeAttribute(Long categoryId, Long attributeId) {
        if (!categoryAttributeRepository.existsByCategoryIdAndAttributeId(
                categoryId, attributeId
        )) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Category attribute not found"
            );
        }

        categoryAttributeRepository.deleteByCategoryIdAndAttributeId(
                categoryId, attributeId
        );
    }
}

package com.brian.ecommerce.service.impl;

import com.brian.ecommerce.dto.CategoryRequest;
import com.brian.ecommerce.dto.CategoryResponse;
import com.brian.ecommerce.entity.Category;
import com.brian.ecommerce.exception.CategoryNotFoundException;
import com.brian.ecommerce.repository.CategoryRepository;
import com.brian.ecommerce.service.CategoryService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {

        Category category = new Category();

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category savedCategory = categoryRepository.save(category);

        return toResponse(savedCategory);
    }

    @Override
    public List<CategoryResponse> getAllCategories() {

        return categoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public CategoryResponse getCategoryById(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: " + id
                        ));

        return toResponse(category);
    }

    @Override
    public CategoryResponse updateCategory(
            Long id,
            CategoryRequest request) {

        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: " + id
                        ));

        existingCategory.setName(request.getName());
        existingCategory.setDescription(request.getDescription());

        Category updatedCategory =
                categoryRepository.save(existingCategory);

        return toResponse(updatedCategory);
    }

    @Override
    public void deleteCategory(Long id) {

        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: " + id
                        ));

        categoryRepository.delete(existingCategory);
    }

    private CategoryResponse toResponse(Category category) {

        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
}
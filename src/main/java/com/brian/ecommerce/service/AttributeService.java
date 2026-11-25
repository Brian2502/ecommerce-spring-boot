
package com.brian.ecommerce.service;

import com.brian.ecommerce.dto.attribute.*;
import com.brian.ecommerce.entity.*;
import com.brian.ecommerce.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AttributeService {

    private final AttributeGroupRepository groupRepository;
    private final AttributeRepository attributeRepository;
    private final ProductAttributeValueRepository valueRepository;
    private final ProductRepository productRepository;
    private final CategoryAttributeRepository categoryAttributeRepository;


    public AttributeService(
            AttributeGroupRepository groupRepository,
            AttributeRepository attributeRepository,
            ProductAttributeValueRepository valueRepository,
            ProductRepository productRepository,
            CategoryAttributeRepository categoryAttributeRepository
    ) {
        this.groupRepository = groupRepository;
        this.attributeRepository = attributeRepository;
        this.valueRepository = valueRepository;
        this.productRepository = productRepository;
        this.categoryAttributeRepository = categoryAttributeRepository;
    }

    @Transactional
    public AttributeGroup createGroup(AttributeGroupRequest request) {
        String name = request.name().trim();

        if (groupRepository.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Attribute group already exists"
            );
        }

        AttributeGroup group = new AttributeGroup();
        group.setName(name);
        group.setSortOrder(
                request.sortOrder() == null ? 0 : request.sortOrder()
        );

        return groupRepository.save(group);
    }

    @Transactional(readOnly = true)
    public List<AttributeGroup> getGroups() {
        return groupRepository.findAllByOrderBySortOrderAscIdAsc();
    }

    @Transactional
    public Attribute createAttribute(AttributeRequest request) {
        AttributeGroup group = groupRepository.findById(request.groupId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Attribute group not found"
                ));

        String code = request.code().trim();

        if (attributeRepository.existsByGroupIdAndCodeIgnoreCase(
                group.getId(), code
        )) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Attribute code already exists in group"
            );
        }

        Attribute attribute = new Attribute();
        attribute.setGroup(group);
        attribute.setName(request.name().trim());
        attribute.setCode(code);
        attribute.setUnit(request.unit());
        attribute.setSortOrder(
                request.sortOrder() == null ? 0 : request.sortOrder()
        );

        return attributeRepository.save(attribute);
    }


    @Transactional
    public void setProductAttribute(
            Long productId,
            Long attributeId,
            AttributeValueRequest request
    ) {
        // 1. Kiểm tra sản phẩm tồn tại
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product not found"
                ));

        // 2. Kiểm tra thuộc tính tồn tại
        Attribute attribute = attributeRepository.findById(attributeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Attribute not found"
                ));

        // 3. Xác định danh mục của sản phẩm
        Long categoryId = product.getCategory().getId();

        // 4. Kiểm tra thuộc tính có thuộc danh mục không
        boolean allowed = categoryAttributeRepository
                .existsByCategoryIdAndAttributeId(
                        categoryId,
                        attributeId
                );

        if (!allowed) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Attribute does not belong to product category"
            );
        }

        // 5. Tìm giá trị đã lưu hoặc tạo mới
        ProductAttributeValue value = valueRepository
                .findByProductIdAndAttributeId(productId, attributeId)
                .orElseGet(ProductAttributeValue::new);

        // 6. Cập nhật thông số
        value.setProduct(product);
        value.setAttribute(attribute);
        value.setValue(request.value().trim());

        // 7. Lưu vào database
        valueRepository.save(value);
    }


    @Transactional(readOnly = true)
    public List<SpecificationResponse> getSpecifications(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Product not found"
            );
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product not found"
                ));

        Long categoryId = product.getCategory().getId();

        List<ProductAttributeValue> values =
                valueRepository.findSpecifications(productId)
                        .stream()
                        .filter(value -> categoryAttributeRepository
                                .existsByCategoryIdAndAttributeId(
                                        categoryId,
                                        value.getAttribute().getId()
                                ))
                        .toList();

        Map<Long, List<SpecificationResponse.SpecificationItem>> grouped =
                new LinkedHashMap<>();

        Map<Long, String> groupNames = new LinkedHashMap<>();

        for (ProductAttributeValue value : values) {
            Attribute attribute = value.getAttribute();
            AttributeGroup group = attribute.getGroup();

            groupNames.put(group.getId(), group.getName());

            grouped.computeIfAbsent(
                    group.getId(), ignored -> new ArrayList<>()
            ).add(new SpecificationResponse.SpecificationItem(
                    attribute.getId(),
                    attribute.getName(),
                    attribute.getCode(),
                    value.getValue(),
                    attribute.getUnit()
            ));
        }

        List<SpecificationResponse> result = new ArrayList<>();

        grouped.forEach((groupId, items) ->
                result.add(new SpecificationResponse(
                        groupId,
                        groupNames.get(groupId),
                        items
                ))
        );

        return result;
    }

    @Transactional(readOnly = true)
    public List<Attribute> getAttributes(Long groupId) {
        if (groupId != null) {
            if (!groupRepository.existsById(groupId)) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Attribute group not found"
                );
            }

            return attributeRepository
                    .findByGroupIdOrderBySortOrderAscIdAsc(groupId);
        }

        return attributeRepository.findAll(
                Sort.by(
                        Sort.Order.asc("group.sortOrder"),
                        Sort.Order.asc("group.id"),
                        Sort.Order.asc("sortOrder"),
                        Sort.Order.asc("id")
                )
        );
    }
}

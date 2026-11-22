
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

    public AttributeService(
            AttributeGroupRepository groupRepository,
            AttributeRepository attributeRepository,
            ProductAttributeValueRepository valueRepository,
            ProductRepository productRepository
    ) {
        this.groupRepository = groupRepository;
        this.attributeRepository = attributeRepository;
        this.valueRepository = valueRepository;
        this.productRepository = productRepository;
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
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found"
                ));

        Attribute attribute = attributeRepository.findById(attributeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Attribute not found"
                ));

        ProductAttributeValue value = valueRepository
                .findByProductIdAndAttributeId(productId, attributeId)
                .orElseGet(ProductAttributeValue::new);

        value.setProduct(product);
        value.setAttribute(attribute);
        value.setValue(request.value().trim());

        valueRepository.save(value);
    }

    @Transactional(readOnly = true)
    public List<SpecificationResponse> getSpecifications(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Product not found"
            );
        }

        List<ProductAttributeValue> values =
                valueRepository.findSpecifications(productId);

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

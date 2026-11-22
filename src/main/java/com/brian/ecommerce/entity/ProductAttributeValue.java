
package com.brian.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "product_attribute_values",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_product_attribute",
                columnNames = {"product_id", "attribute_id"}
        )
)
@Getter
@Setter
public class ProductAttributeValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attribute_id", nullable = false)
    private Attribute attribute;

    @Column(name = "attribute_value", nullable = false, length = 500)
    private String value;
}

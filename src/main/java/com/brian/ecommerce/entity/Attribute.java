
package com.brian.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "attributes",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_attribute_group_code",
                columnNames = {"group_id", "code"}
        )
)
@Getter
@Setter
public class Attribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String code;

    @Column(length = 30)
    private String unit;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id", nullable = false)
    private AttributeGroup group;
}


package com.brian.ecommerce.exception;

public class OrderAccessDeniedException extends RuntimeException {

    public OrderAccessDeniedException(String message) {
        super(message);
    }
}

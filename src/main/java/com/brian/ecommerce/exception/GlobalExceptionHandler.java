package com.brian.ecommerce.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;



@RestControllerAdvice
public class GlobalExceptionHandler {

    // Xử lý lỗi validation
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidationException(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldError()
                .getDefaultMessage();

        return new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                message
        );
    }

    // Xử lý không tìm thấy Category
    @ExceptionHandler(CategoryNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleCategoryNotFoundException(
            CategoryNotFoundException ex) {

        return new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage()
        );
    }

    @ExceptionHandler(ProductNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleProductNotFoundException(
            ProductNotFoundException ex) {

        return new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage()
        );
    }

    public record ErrorResponse(
            int status,
            String message
    ) {
    }

    @ExceptionHandler(InvalidOrderStatusException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleInvalidOrderStatusException(
            InvalidOrderStatusException ex) {

        return new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage()
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleIllegalArgumentException(
            IllegalArgumentException ex) {

        return new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage()
        );
    }


    @ExceptionHandler(OrderNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleOrderNotFoundException(
            OrderNotFoundException ex) {

        return new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage()
        );
    }

    @ExceptionHandler(OrderAccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorResponse handleOrderAccessDeniedException(
            OrderAccessDeniedException ex) {

        return new ErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                ex.getMessage()
        );
    }

}
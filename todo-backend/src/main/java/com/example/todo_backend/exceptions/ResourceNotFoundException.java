package com.example.todo_backend.exceptions;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s with %s [%s] not found", resourceName, fieldName, fieldValue));
    }
}

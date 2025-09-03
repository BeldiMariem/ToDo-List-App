package com.example.todo_backend.dtos;

import java.time.LocalDateTime;

public record NotificationDTO(
        Long id,
        boolean seen,
        String message,
        Long userId,
        LocalDateTime timestamp
        ) {}

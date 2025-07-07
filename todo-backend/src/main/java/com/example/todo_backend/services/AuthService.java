package com.example.todo_backend.services;

import com.example.todo_backend.dtos.LoginRequest;
import com.example.todo_backend.dtos.RegisterRequest;
import com.example.todo_backend.entities.User;

public interface AuthService {
    Long getCurrentUserId();
    User register(RegisterRequest request);
    User authenticate(LoginRequest request);
}

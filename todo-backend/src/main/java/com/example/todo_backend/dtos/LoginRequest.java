package com.example.todo_backend.dtos;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}
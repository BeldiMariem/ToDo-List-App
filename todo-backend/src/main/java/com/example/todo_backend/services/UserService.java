package com.example.todo_backend.services;

import com.example.todo_backend.dtos.PasswordUpdateDTO;
import com.example.todo_backend.dtos.UserDTO;
import com.example.todo_backend.dtos.UserUpdateDTO;



public interface UserService {
    UserDTO updateProfile(Long userId, UserUpdateDTO dto);
    void updatePassword(Long userId, PasswordUpdateDTO dto);
    void deleteUser(Long userId, String currentPassword);
}

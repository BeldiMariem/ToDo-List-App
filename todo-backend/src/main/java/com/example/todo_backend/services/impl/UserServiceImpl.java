package com.example.todo_backend.services.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.todo_backend.dtos.PasswordUpdateDTO;
import com.example.todo_backend.dtos.UserDTO;
import com.example.todo_backend.dtos.UserUpdateDTO;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.exceptions.BadRequestException;
import com.example.todo_backend.exceptions.ResourceNotFoundException;
import com.example.todo_backend.mappers.UserMapper;
import com.example.todo_backend.repositories.UserRepository;
import com.example.todo_backend.services.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserDTO updateProfile(Long userId, UserUpdateDTO dto) {
        User user = findUserById(userId);

        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());

        return userMapper.toDTO(user);
    }

    @Override
    @Transactional
    public void updatePassword(Long userId, PasswordUpdateDTO dto) {
        User user = findUserById(userId);

        if (!passwordEncoder.matches(dto.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Incorrect current password");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
    }

    @Override
    @Transactional
    public void deleteUser(Long userId, String currentPassword) {
        User user = findUserById(userId);

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("Incorrect password");
        }

        userRepository.delete(user);
    }


    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }
}

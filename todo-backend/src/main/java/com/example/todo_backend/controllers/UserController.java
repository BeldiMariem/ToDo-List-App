package com.example.todo_backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.todo_backend.dtos.PasswordUpdateDTO;
import com.example.todo_backend.dtos.UserDTO;
import com.example.todo_backend.dtos.UserDeleteRequestDTO;
import com.example.todo_backend.dtos.UserUpdateDTO;
import com.example.todo_backend.security.CustomUserDetails;
import com.example.todo_backend.services.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PutMapping("/updateProfile")
    public ResponseEntity<UserDTO> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserUpdateDTO dto) {

        Long userId = getUserIdFromPrincipal(userDetails);
        UserDTO updatedUser = userService.updateProfile(userId, dto);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> updatePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PasswordUpdateDTO dto) {

        Long userId = getUserIdFromPrincipal(userDetails);
        userService.updatePassword(userId, dto);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserDeleteRequestDTO dto) {

        Long userId = getUserIdFromPrincipal(userDetails);
        userService.deleteUser(userId, dto.getPassword());
        return ResponseEntity.noContent().build();
    }

    private Long getUserIdFromPrincipal(UserDetails userDetails) {

    return ((CustomUserDetails) userDetails).getUser().getId();
    }
}

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
import com.example.todo_backend.repositories.UserRepository;
import com.example.todo_backend.security.CustomUserDetails;
import com.example.todo_backend.services.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
        private final UserRepository    userRepository;


    @PutMapping("/updateProfile")
    public ResponseEntity<UserDTO> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserUpdateDTO dto) {

        Long userId = getUserIdFromPrincipal(userDetails);
        UserDTO updatedUser = userService.updateProfile(userId, dto);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/updatePassword")
    public ResponseEntity<Void> updatePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PasswordUpdateDTO dto) {

        Long userId = getUserIdFromPrincipal(userDetails);
        userService.updatePassword(userId, dto);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/deleteUser")
    public ResponseEntity<Void> deleteUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserDeleteRequestDTO dto) {

        Long userId = getUserIdFromPrincipal(userDetails);
        userService.deleteUser(userId, dto.getPassword());
        return ResponseEntity.noContent().build();
    }

    private Long getUserIdFromPrincipal(UserDetails userDetails) {
        if (userDetails instanceof CustomUserDetails) {
            return ((CustomUserDetails) userDetails).getUser().getId();
        }

        // ✅ Fallback : chercher l’utilisateur dans la base par son username
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("User not found"))
                .getId();
    }
}

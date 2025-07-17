package com.example.todo_backend.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.todo_backend.dtos.JwtResponse;
import com.example.todo_backend.dtos.LoginRequest;
import com.example.todo_backend.dtos.RegisterRequest;
import com.example.todo_backend.dtos.UserDTO;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.security.JwtUtil;
import com.example.todo_backend.services.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthControllerTest {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerUser(@RequestBody RegisterRequest request) {
        User user = authService.register(request);
        UserDTO userDTO = new UserDTO(user.getId(), user.getUsername(), user.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(userDTO);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> loginUser(@RequestBody LoginRequest request) {
        User user = authService.authenticate(request);
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtUtil.generateToken(userDetails);
        return ResponseEntity.ok(new JwtResponse(token));
    }
}

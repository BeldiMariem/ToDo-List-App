package com.example.todo_backend.services.impl;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.todo_backend.dtos.LoginRequest;
import com.example.todo_backend.dtos.RegisterRequest;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.exceptions.AuthenticationException;
import com.example.todo_backend.exceptions.ResourceNotFoundException;
import com.example.todo_backend.repositories.UserRepository;

public class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthServiceImpl authService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void getCurrentUserId_shouldReturnUserId_whenAuthenticated() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("user123");

        User user = new User();
        user.setId(42L);
        user.setUsername("user123");

        when(userRepository.findByUsername("user123")).thenReturn(Optional.of(user));

        Long userId = authService.getCurrentUserId();

        assertEquals(42L, userId);
    }

    @Test
    void getCurrentUserId_shouldThrow_whenNotAuthenticated() {
        when(securityContext.getAuthentication()).thenReturn(null);

        assertThrows(AuthenticationException.class, () -> authService.getCurrentUserId());
    }

    @Test
    void register_shouldEncodePasswordAndSaveUser() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("newuser@example.com");
        request.setPassword("password");

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setUsername("newuser");
        savedUser.setEmail("newuser@example.com");
        savedUser.setPassword("encodedPassword");

        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = authService.register(request);

        assertNotNull(result);
        assertEquals("newuser", result.getUsername());
        assertEquals("newuser@example.com", result.getEmail());
        assertEquals("encodedPassword", result.getPassword());
        verify(passwordEncoder).encode("password");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void authenticate_shouldReturnUser_whenCredentialsValid() {
        LoginRequest request = new LoginRequest();
        request.setUsername("user1");
        request.setPassword("pass");

        User user = new User();
        user.setUsername("user1");
        user.setPassword("encodedPass");

        when(userRepository.findByUsername("user1")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass", "encodedPass")).thenReturn(true);

        User result = authService.authenticate(request);

        assertEquals(user, result);
    }

    @Test
    void authenticate_shouldThrow_whenUserNotFound() {
        LoginRequest request = new LoginRequest();
        request.setUsername("missing");
        request.setPassword("pass");

        when(userRepository.findByUsername("missing")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.authenticate(request));
    }

    @Test
    void authenticate_shouldThrow_whenPasswordInvalid() {
        LoginRequest request = new LoginRequest();
        request.setUsername("user1");
        request.setPassword("wrongpass");

        User user = new User();
        user.setUsername("user1");
        user.setPassword("encodedPass");

        when(userRepository.findByUsername("user1")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpass", "encodedPass")).thenReturn(false);

        assertThrows(AuthenticationException.class, () -> authService.authenticate(request));
    }
}

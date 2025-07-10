package com.example.todo_backend.services.impl;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.todo_backend.dtos.PasswordUpdateDTO;
import com.example.todo_backend.dtos.UserDTO;
import com.example.todo_backend.dtos.UserUpdateDTO;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.exceptions.BadRequestException;
import com.example.todo_backend.exceptions.ResourceNotFoundException;
import com.example.todo_backend.mappers.UserMapper;
import com.example.todo_backend.repositories.UserRepository;

class UserServiceImplTest {

    @InjectMocks
    private UserServiceImpl userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    private User mockUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("mariem");
        mockUser.setEmail("mariem@example.com");
        mockUser.setPassword("encodedPassword");
    }

    @Test
    void testUpdateProfile_Success() {
        UserUpdateDTO dto = new UserUpdateDTO("newUser", "new@example.com");
        UserDTO expectedDto = new UserDTO(1L, "newUser", "new@example.com");

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(userMapper.toDTO(mockUser)).thenReturn(expectedDto);

        UserDTO result = userService.updateProfile(1L, dto);

        assertEquals(expectedDto, result);
        assertEquals("newUser", mockUser.getUsername());
        assertEquals("new@example.com", mockUser.getEmail());
    }

    @Test
    void testUpdateProfile_UserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () ->
                userService.updateProfile(99L, new UserUpdateDTO("user", "email")));
    }

    @Test
    void testUpdatePassword_Success() {
        PasswordUpdateDTO dto = new PasswordUpdateDTO("oldPassword", "newPassword");

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("oldPassword", "encodedPassword")).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("newEncodedPassword");

        userService.updatePassword(1L, dto);

        verify(userRepository, times(1)).findById(1L);
        assertEquals("newEncodedPassword", mockUser.getPassword());
    }

    @Test
    void testUpdatePassword_IncorrectOldPassword() {
        PasswordUpdateDTO dto = new PasswordUpdateDTO("wrongOld", "newPassword");

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("wrongOld", "encodedPassword")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> userService.updatePassword(1L, dto));
    }

    @Test
    void testDeleteUser_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("encodedPassword", "encodedPassword")).thenReturn(true);

        userService.deleteUser(1L, "encodedPassword");

        verify(userRepository).delete(mockUser);
    }

    @Test
    void testDeleteUser_IncorrectPassword() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> userService.deleteUser(1L, "wrongPassword"));
    }

    @Test
    void testDeleteUser_UserNotFound() {
        when(userRepository.findById(42L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.deleteUser(42L, "pass"));
    }
}

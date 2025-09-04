package com.example.todo_backend.services.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.todo_backend.dtos.BoardDTO;
import com.example.todo_backend.dtos.BoardUpdateDTO;
import com.example.todo_backend.entities.Board;
import com.example.todo_backend.entities.BoardMember;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.mappers.BoardMapper;
import com.example.todo_backend.repositories.BoardMemberRepository;
import com.example.todo_backend.repositories.BoardRepository;
import com.example.todo_backend.repositories.UserRepository;
import com.example.todo_backend.services.AuthService;
import com.example.todo_backend.services.NotificationService;

@ExtendWith(MockitoExtension.class)
class BoardServiceImplTest {

    @Mock
    private BoardRepository boardRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private BoardMemberRepository boardMemberRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AuthService authService;
    @Mock 
    private BoardMapper boardMapper;

    @InjectMocks
    private BoardServiceImpl boardService;

    @BeforeEach
    void setUp() {
        when(authService.getCurrentUserId()).thenReturn(1L);

        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
    }

@Test
void updateBoard_shouldUpdateSuccessfullyEvenWithoutAdminPermission() {
    BoardUpdateDTO updateDto = new BoardUpdateDTO(10L, "New Name", List.of(2L), "MEMBER");

    Board board = new Board();
    board.setId(10L);
    board.setName("Old Name");

    BoardMember member = new BoardMember();
    User memberUser = createTestUser(1L, "testuser", "test@email.com", "password");
    member.setUser(memberUser);
    member.setRole("MEMBER"); 
    
    board.setMembers(new ArrayList<>(List.of(member)));

    User newUser = createTestUser(2L, "newuser", "new@email.com", "password");
    when(userRepository.findById(1L)).thenReturn(Optional.of(memberUser));
    when(userRepository.findById(2L)).thenReturn(Optional.of(newUser));
    when(boardRepository.findById(10L)).thenReturn(Optional.of(board));
    when(boardRepository.save(any())).thenReturn(board);
    
    BoardDTO mockDto = new BoardDTO();
    when(boardMapper.toSimpleDto(any())).thenReturn(mockDto);

    assertDoesNotThrow(() -> boardService.updateBoard(updateDto, 1L));
    verify(boardRepository).save(any());
}
    @Test
    void updateBoard_shouldUpdateNameAndMembers_ifAuthorized() {
        BoardUpdateDTO updateDto = new BoardUpdateDTO(10L, "New Name", List.of(2L), "MEMBER");

        Board board = new Board();
        board.setId(10L);
        board.setName("Old Name");

        BoardMember adminMember = new BoardMember();
        adminMember.setUser(createTestUser(1L, "admin", "admin@email.com", "password"));
        adminMember.setRole("ADMIN");
        board.setMembers(new ArrayList<>(List.of(adminMember)));

        User newUser = createTestUser(2L, "newuser", "new@email.com", "password");
        when(userRepository.findById(2L)).thenReturn(Optional.of(newUser));
        when(boardRepository.findById(10L)).thenReturn(Optional.of(board));
        when(boardRepository.save(any())).thenReturn(board);
        
        BoardDTO mockDto = new BoardDTO();
        when(boardMapper.toSimpleDto(any())).thenReturn(mockDto);

        assertDoesNotThrow(() -> boardService.updateBoard(updateDto, 1L));
        verify(boardRepository).save(any());
    }

    private User createTestUser(Long id, String username, String email, String password) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);
        return user;
    }
}
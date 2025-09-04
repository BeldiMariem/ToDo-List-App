package com.example.todo_backend.services.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.todo_backend.dtos.ListDTO;
import com.example.todo_backend.entities.Board;
import com.example.todo_backend.entities.ListEntity;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.mappers.ListMapper;
import com.example.todo_backend.repositories.BoardRepository;
import com.example.todo_backend.repositories.ListEntityRepository;
import com.example.todo_backend.repositories.UserRepository;
import com.example.todo_backend.services.AuthService;
import com.example.todo_backend.services.NotificationService;
@ExtendWith(MockitoExtension.class)
class ListServiceImplTest {

    @Mock
    private ListEntityRepository listRepository;
    @Mock
    private BoardRepository boardRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AuthService authService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private ListMapper listMapper;

    @InjectMocks
    private ListServiceImpl listService;

   
    @Test
    void getListsByBoardId_shouldReturnListsForBoard() {
        Long boardId = 1L;

        ListEntity list1 = new ListEntity();
        list1.setId(1L);
        list1.setName("List 1");

        ListEntity list2 = new ListEntity();
        list2.setId(2L);
        list2.setName("List 2");

        when(listRepository.findByBoardId(boardId)).thenReturn(List.of(list1, list2));
        
        ListDTO dto1 = new ListDTO();
        ListDTO dto2 = new ListDTO();
        when(listMapper.toDto(list1)).thenReturn(dto1);
        when(listMapper.toDto(list2)).thenReturn(dto2);

        List<ListDTO> result = listService.getListsByBoardId(boardId);
        assertEquals(2, result.size());
    }

    @Test
    void createList_shouldCreateListSuccessfully() {
        when(authService.getCurrentUserId()).thenReturn(1L);
        
        ListDTO listDto = new ListDTO();
        listDto.setId(null);
        listDto.setName("Test List");
        listDto.setColor("blue");
        listDto.setBoardId(1L);

        Board board = new Board();
        board.setId(1L);
        board.setName("Test Board");
        board.setMembers(new ArrayList<>());

        when(boardRepository.findById(1L)).thenReturn(Optional.of(board));
        when(listRepository.save(any())).thenAnswer(invocation -> {
            ListEntity list = invocation.getArgument(0);
            list.setId(1L);
            return list;
        });
        
        User user = createTestUser(1L, "testuser", "test@email.com", "password");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        
        ListDTO mockDto = new ListDTO();
        when(listMapper.toDto(any())).thenReturn(mockDto);

        assertDoesNotThrow(() -> listService.createList(listDto));
        verify(listRepository).save(any());
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
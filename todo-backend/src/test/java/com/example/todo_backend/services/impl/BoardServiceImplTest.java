package com.example.todo_backend.services.impl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

import com.example.todo_backend.dtos.BoardDTO;
import com.example.todo_backend.dtos.BoardUpdateDTO;
import com.example.todo_backend.entities.Board;
import com.example.todo_backend.entities.BoardMember;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.exceptions.ResourceNotFoundException;
import com.example.todo_backend.mappers.BoardMapper;
import com.example.todo_backend.repositories.BoardRepository;
import com.example.todo_backend.repositories.UserRepository;

public class BoardServiceImplTest {

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private BoardMapper boardMapper;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BoardServiceImpl boardService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createBoard_shouldCreateBoardAndAddAdminMember() {
        BoardDTO dto = new BoardDTO();
        dto.setName("Test Board");

        Board savedBoard = new Board();
        savedBoard.setId(1L);
        savedBoard.setName("Test Board");
        savedBoard.setMembers(new ArrayList<>());

        User user = new User();
        user.setId(10L);

        BoardDTO returnedDto = new BoardDTO();
        returnedDto.setId(1L);
        returnedDto.setName("Test Board");

        when(boardRepository.save(any(Board.class))).thenReturn(savedBoard);
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(boardMapper.toSimpleDto(savedBoard)).thenReturn(returnedDto);

        BoardDTO result = boardService.createBoard(dto, 10L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(boardRepository).save(any(Board.class));
        verify(userRepository).findById(10L);
        assertTrue(savedBoard.getMembers().stream()
                .anyMatch(member -> member.getUser().getId().equals(10L) && "ADMIN".equalsIgnoreCase(member.getRole())));
    }

    @Test
    void getBoardsByUserId_shouldReturnMappedBoards() {
        User user = new User();
        user.setId(10L);

        Board board1 = new Board();
        board1.setId(1L);
        Board board2 = new Board();
        board2.setId(2L);

        List<Board> boards = Arrays.asList(board1, board2);

        BoardDTO dto1 = new BoardDTO();
        dto1.setId(1L);
        BoardDTO dto2 = new BoardDTO();
        dto2.setId(2L);

        when(boardRepository.findByMembers_User_Id(10L)).thenReturn(boards);
        when(boardMapper.toSimpleDto(board1)).thenReturn(dto1);
        when(boardMapper.toSimpleDto(board2)).thenReturn(dto2);

        List<BoardDTO> result = boardService.getBoardsByUserId(10L);

        assertEquals(2, result.size());
        assertTrue(result.contains(dto1));
        assertTrue(result.contains(dto2));
    }

    @Test
    void getBoardById_shouldReturnDto() {
        Board board = new Board();
        board.setId(5L);

        BoardDTO dto = new BoardDTO();
        dto.setId(5L);

        when(boardRepository.findById(5L)).thenReturn(Optional.of(board));
        when(boardMapper.toSimpleDto(board)).thenReturn(dto);

        BoardDTO result = boardService.getBoardById(5L);

        assertEquals(5L, result.getId());
    }

    @Test
    void getBoardById_shouldThrowIfNotFound() {
        when(boardRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> boardService.getBoardById(999L));
    }

    @Test
    void deleteBoard_shouldDeleteIfExists() {
        when(boardRepository.existsById(10L)).thenReturn(true);

        boardService.deleteBoard(10L);

        verify(boardRepository).deleteById(10L);
    }

    @Test
    void deleteBoard_shouldThrowIfNotFound() {
        when(boardRepository.existsById(999L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> boardService.deleteBoard(999L));
    }

    @Test
    void updateBoard_shouldUpdateNameAndMembers_ifAuthorized() {
        Board board = new Board();
        board.setId(1L);
        board.setName("Old Name");
        board.setMembers(new ArrayList<>());

        User adminUser = new User();
        adminUser.setId(10L);

        BoardMember adminMember = new BoardMember();
        adminMember.setUser(adminUser);
        adminMember.setRole("ADMIN");
        adminMember.setBoard(board);

        board.getMembers().add(adminMember);

        BoardUpdateDTO updateDTO = new BoardUpdateDTO();
        updateDTO.setBoardId(1L);
        updateDTO.setNewName("New Name");
        updateDTO.setUserIds(Arrays.asList(20L));
        updateDTO.setRole("MEMBER");

        User newUser = new User();
        newUser.setId(20L);

        when(boardRepository.findById(1L)).thenReturn(Optional.of(board));
        when(userRepository.findById(20L)).thenReturn(Optional.of(newUser));
        when(boardRepository.save(board)).thenReturn(board);
        when(boardMapper.toSimpleDto(board)).thenReturn(new BoardDTO() {
            {
                setId(1L);
                setName("New Name");
            }
        });

        BoardDTO result = boardService.updateBoard(updateDTO, 10L);

        assertEquals("New Name", board.getName());
        assertTrue(board.getMembers().stream().anyMatch(m -> m.getUser().getId().equals(20L)));
        assertEquals(1L, result.getId());
        verify(boardRepository).save(board);
    }

    @Test
    void updateBoard_shouldThrowIfNoPermission() {
        Board board = new Board();
        board.setId(1L);
        board.setMembers(new ArrayList<>());

        BoardUpdateDTO updateDTO = new BoardUpdateDTO();
        updateDTO.setBoardId(1L);

        when(boardRepository.findById(1L)).thenReturn(Optional.of(board));

        assertThrows(IllegalStateException.class, () -> boardService.updateBoard(updateDTO, 10L));
    }
}

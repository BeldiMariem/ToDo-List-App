package com.example.todo_backend.controllers;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.example.todo_backend.dtos.BoardDTO;
import com.example.todo_backend.dtos.BoardUpdateDTO;
import com.example.todo_backend.services.AuthService;
import com.example.todo_backend.services.BoardService;
import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class BoardControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @Mock
    private BoardService boardService;

    @InjectMocks
    private BoardController boardController;

    private ObjectMapper objectMapper = new ObjectMapper();
    private BoardDTO testBoardDTO;
    private BoardUpdateDTO testBoardUpdateDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(boardController).build();

        testBoardDTO = new BoardDTO();
        testBoardDTO.setId(1L);
        testBoardDTO.setName("Test Board");
        
        testBoardUpdateDTO = new BoardUpdateDTO();
        testBoardUpdateDTO.setBoardId(1L);
        testBoardUpdateDTO.setNewName("Updated Board");
    }

    @Test
    void createBoard_shouldReturnBoardDTO() throws Exception {
        Long userId = 1L;
        when(authService.getCurrentUserId()).thenReturn(userId);
        when(boardService.createBoard(any(BoardDTO.class), eq(userId))).thenReturn(testBoardDTO);

        mockMvc.perform(post("/api/boards/createBoard")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBoardDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Test Board"));

        verify(authService).getCurrentUserId();
        verify(boardService).createBoard(any(BoardDTO.class), eq(userId));
    }

    @Test
    void updateBoard_shouldReturnUpdatedBoardDTO() throws Exception {
        Long userId = 1L;
        when(authService.getCurrentUserId()).thenReturn(userId);
        when(boardService.updateBoard(any(BoardUpdateDTO.class), eq(userId))).thenReturn(testBoardDTO);

        mockMvc.perform(put("/api/boards/updateBoard")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBoardUpdateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Test Board"));

        verify(authService).getCurrentUserId();
        verify(boardService).updateBoard(any(BoardUpdateDTO.class), eq(userId));
    }

    @Test
    void getBoardById_shouldReturnBoardDTO() throws Exception {
        Long boardId = 1L;
        when(boardService.getBoardById(boardId)).thenReturn(testBoardDTO);

        mockMvc.perform(get("/api/boards/getBoard/{id}", boardId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Test Board"));

        verify(boardService).getBoardById(boardId);
    }

    @Test
    void getBoardsByUserId_shouldReturnListOfBoardDTOs() throws Exception {
        Long userId = 1L;
        List<BoardDTO> boards = List.of(testBoardDTO);
        when(authService.getCurrentUserId()).thenReturn(userId);
        when(boardService.getBoardsByUserId(userId)).thenReturn(boards);

        mockMvc.perform(get("/api/boards/getBoardByUser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].name").value("Test Board"));

        verify(authService).getCurrentUserId();
        verify(boardService).getBoardsByUserId(userId);
    }

    @Test
    void deleteBoard_shouldReturnNoContent() throws Exception {
        Long boardId = 1L;
        doNothing().when(boardService).deleteBoard(boardId);

        mockMvc.perform(delete("/api/boards/deleteBoard/{id}", boardId))
                .andExpect(status().isNoContent());

        verify(boardService).deleteBoard(boardId);
    }

    @Test
    void createBoard_shouldHandleServiceException() throws Exception {
        Long userId = 1L;
        when(authService.getCurrentUserId()).thenReturn(userId);
        when(boardService.createBoard(any(BoardDTO.class), eq(userId)))
                .thenThrow(new RuntimeException("Service error"));

        mockMvc.perform(post("/api/boards/createBoard")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBoardDTO)))
                .andExpect(status().isInternalServerError());

        verify(authService).getCurrentUserId();
        verify(boardService).createBoard(any(BoardDTO.class), eq(userId));
    }

    @Test
    void getBoardById_shouldHandleNotFound() throws Exception {
        Long boardId = 999L;
        when(boardService.getBoardById(boardId))
                .thenThrow(new RuntimeException("Board not found"));

        mockMvc.perform(get("/api/boards/getBoard/{id}", boardId))
                .andExpect(status().isNotFound());

        verify(boardService).getBoardById(boardId);
    }
}
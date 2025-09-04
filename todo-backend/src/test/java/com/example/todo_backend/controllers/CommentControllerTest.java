package com.example.todo_backend.controllers;

import java.security.Principal;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.example.todo_backend.dtos.CommentDTO;
import com.example.todo_backend.services.CommentService;
import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class CommentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CommentService commentService;

    @Mock
    private Principal principal;

    @InjectMocks
    private CommentController commentController;

    private ObjectMapper objectMapper = new ObjectMapper();
    private CommentDTO testCommentDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(commentController)
                .setControllerAdvice(commentController) 
                .build();

        testCommentDTO = new CommentDTO();
        testCommentDTO.setId(1L);
        testCommentDTO.setContent("Test comment");
        testCommentDTO.setCardId(1L);
    }

    @Test
    void createComment_shouldReturnCreatedComment() throws Exception {
        when(principal.getName()).thenReturn("testuser");
        when(commentService.createComment(any(CommentDTO.class), eq("testuser"))).thenReturn(testCommentDTO);

        mockMvc.perform(post("/api/comments/createComment")
                .principal(principal) 
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCommentDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.content").value("Test comment"));

        verify(commentService).createComment(any(CommentDTO.class), eq("testuser"));
    }

    @Test
    void createComment_shouldHandleServiceException() throws Exception {
        when(principal.getName()).thenReturn("testuser");
        when(commentService.createComment(any(CommentDTO.class), eq("testuser")))
                .thenThrow(new RuntimeException("Service error"));

        mockMvc.perform(post("/api/comments/createComment")
                .principal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCommentDTO)))
                .andExpect(status().isInternalServerError());

        verify(commentService).createComment(any(CommentDTO.class), eq("testuser"));
    }

    @Test
    void deleteComment_shouldHandleNotFound() throws Exception {
        Long commentId = 999L;
        doThrow(new RuntimeException("Comment not found"))
                .when(commentService).deleteComment(commentId);

        mockMvc.perform(delete("/api/comments/deleteComment/{id}", commentId))
                .andExpect(status().isNotFound());

        verify(commentService).deleteComment(commentId);
    }

    @Test
    void getCommentsByCard_shouldReturnComments() throws Exception {
        Long cardId = 1L;
        when(commentService.getCommentsByCardId(cardId)).thenReturn(List.of(testCommentDTO));

        mockMvc.perform(get("/api/comments/getCommentsByCard/{cardId}", cardId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].content").value("Test comment"));

        verify(commentService).getCommentsByCardId(cardId);
    }

    @Test
    void deleteComment_shouldReturnNoContent() throws Exception {
        Long commentId = 1L;
        doNothing().when(commentService).deleteComment(commentId);

        mockMvc.perform(delete("/api/comments/deleteComment/{id}", commentId))
                .andExpect(status().isNoContent());

        verify(commentService).deleteComment(commentId);
    }
}
package com.example.todo_backend.services.impl;

import java.time.LocalDateTime;
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

import com.example.todo_backend.dtos.CommentDTO;
import com.example.todo_backend.dtos.UserDTO;
import com.example.todo_backend.entities.Card;
import com.example.todo_backend.entities.Comment;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.exceptions.ResourceNotFoundException;
import com.example.todo_backend.mappers.CommentMapper;
import com.example.todo_backend.repositories.CardRepository;
import com.example.todo_backend.repositories.CommentRepository;
import com.example.todo_backend.repositories.UserRepository;

public class CommentServiceImplTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private CommentMapper commentMapper;

    @Mock
    private CardRepository cardRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CommentServiceImpl commentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createComment_shouldSaveAndReturnDto() {
        Card card = new Card();
        card.setId(1L);

        User user = new User();
        user.setId(2L);
        user.setUsername("testUser");
        user.setEmail("testUser@gmail.com");

        CommentDTO inputDto = new CommentDTO();
        inputDto.setContent("Nice card!");
        inputDto.setCardId(1L);

        Comment savedComment = new Comment();
        savedComment.setId(100L);
        savedComment.setContent("Nice card!");
        savedComment.setCard(card);
        savedComment.setUser(user);
        savedComment.setCreatedAt(LocalDateTime.now());

        CommentDTO savedDto = new CommentDTO();
        savedDto.setId(100L);
        savedDto.setContent("Nice card!");
        savedDto.setCardId(1L);
        savedDto.setUser(new UserDTO(user.getId(), user.getUsername(), user.getEmail()));

        when(userRepository.findByUsername("testUser")).thenReturn(Optional.of(user));
        when(cardRepository.findById(1L)).thenReturn(Optional.of(card));
        when(commentRepository.save(any(Comment.class))).thenReturn(savedComment);

        CommentDTO result = commentService.createComment(inputDto, "testUser");

        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals("Nice card!", result.getContent());
        verify(commentRepository).save(any(Comment.class));
    }

    @Test
    void getCommentsByCardId_shouldReturnListOfDtos() {
        Card card = new Card();
        card.setId(1L);

        Comment comment1 = new Comment();
        comment1.setId(10L);
        comment1.setCard(card);

        Comment comment2 = new Comment();
        comment2.setId(20L);
        comment2.setCard(card);

        CommentDTO dto1 = new CommentDTO();
        dto1.setId(10L);

        CommentDTO dto2 = new CommentDTO();
        dto2.setId(20L);

        when(commentRepository.findAll()).thenReturn(Arrays.asList(comment1, comment2));
        when(commentMapper.toDto(comment1)).thenReturn(dto1);
        when(commentMapper.toDto(comment2)).thenReturn(dto2);

        List<CommentDTO> results = commentService.getCommentsByCardId(1L);

        assertEquals(2, results.size());
        assertTrue(results.contains(dto1));
        assertTrue(results.contains(dto2));
    }

    @Test
    void deleteComment_shouldDeleteIfExists() {
        when(commentRepository.existsById(5L)).thenReturn(true);

        commentService.deleteComment(5L);

        verify(commentRepository).deleteById(5L);
    }

    @Test
    void deleteComment_shouldThrowIfNotFound() {
        when(commentRepository.existsById(999L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> commentService.deleteComment(999L));
    }
}

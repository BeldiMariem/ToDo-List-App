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

import com.example.todo_backend.dtos.CommentDTO;
import com.example.todo_backend.entities.Board;
import com.example.todo_backend.entities.Card;
import com.example.todo_backend.entities.Comment;
import com.example.todo_backend.entities.ListEntity;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.mappers.CommentMapper;
import com.example.todo_backend.repositories.BoardRepository;
import com.example.todo_backend.repositories.CardRepository;
import com.example.todo_backend.repositories.CommentRepository;
import com.example.todo_backend.repositories.UserRepository;
import com.example.todo_backend.services.AuthService;
import com.example.todo_backend.services.NotificationService;

@ExtendWith(MockitoExtension.class)
public class CommentServiceImplTest {

    @Mock private CommentRepository commentRepository;
    @Mock private CardRepository cardRepository;
    @Mock private UserRepository userRepository;
    @Mock private BoardRepository boardRepository;
    @Mock private AuthService authService;
    @Mock private NotificationService notificationService;
    @Mock private CommentMapper commentMapper;

    @InjectMocks
    private CommentServiceImpl commentService;

    @Test
    void getCommentsByCardId_shouldReturnListOfDtos() {
        Long cardId = 1L;

        Card card = new Card();
        card.setId(1L);
        card.setTitle("Test Card");

        Comment comment1 = new Comment();
        comment1.setId(1L);
        comment1.setContent("Comment 1");
        comment1.setCard(card);
        
        User user = createTestUser(1L, "testuser", "test@email.com", "password");
        comment1.setUser(user);

        Comment comment2 = new Comment();
        comment2.setId(2L);
        comment2.setContent("Comment 2");
        comment2.setCard(card);
        comment2.setUser(user);

        when(commentRepository.findByCardId(cardId)).thenReturn(List.of(comment1, comment2));
        List<CommentDTO> result = commentService.getCommentsByCardId(cardId);
        assertEquals(2, result.size());
    }

    @Test
    void createComment_shouldSaveAndReturnDto() {
        CommentDTO commentDto = new CommentDTO(null, "Test comment", 1L, null, null);
        User user = createTestUser(1L, "testuser", "test@email.com", "password");

        Card card = new Card();
        card.setId(1L);
        card.setTitle("Test Card");

        ListEntity list = new ListEntity();
        Board board = new Board();
        board.setMembers(new ArrayList<>());
        list.setBoard(board);
        card.setList(list);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(cardRepository.findById(1L)).thenReturn(Optional.of(card));
        when(commentRepository.save(any())).thenAnswer(invocation -> {
            Comment comment = invocation.getArgument(0);
            comment.setId(1L);
            return comment;
        });
        
        assertDoesNotThrow(() -> commentService.createComment(commentDto, "testuser"));
        verify(commentRepository).save(any());
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
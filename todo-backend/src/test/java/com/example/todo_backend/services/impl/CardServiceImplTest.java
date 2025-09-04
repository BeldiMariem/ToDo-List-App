package com.example.todo_backend.services.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.todo_backend.dtos.CardDTO;
import com.example.todo_backend.entities.Board;
import com.example.todo_backend.entities.Card;
import com.example.todo_backend.entities.ListEntity;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.mappers.CardMapper;
import com.example.todo_backend.repositories.BoardRepository;
import com.example.todo_backend.repositories.CardMemberRepository;
import com.example.todo_backend.repositories.CardRepository;
import com.example.todo_backend.repositories.ListEntityRepository;
import com.example.todo_backend.repositories.UserRepository;
import com.example.todo_backend.services.AuthService;
import com.example.todo_backend.services.NotificationService;
@ExtendWith(MockitoExtension.class)
public class CardServiceImplTest {

    @Mock private CardRepository cardRepository;
    @Mock private ListEntityRepository listRepository;
    @Mock private UserRepository userRepository;
    @Mock private CardMemberRepository cardMemberRepository;
    @Mock private BoardRepository boardRepository;
    @Mock private AuthService authService;
    @Mock private NotificationService notificationService;
    @Mock private CardMapper cardMapper;

    @InjectMocks
    private CardServiceImpl cardService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void getCardsByListId_shouldReturnListOfDtos() {
        Long listId = 1L;

        Card card1 = new Card();
        card1.setId(1L);
        card1.setTitle("Card 1");

        Card card2 = new Card();
        card2.setId(2L);
        card2.setTitle("Card 2");

        when(cardRepository.findByListId(listId)).thenReturn(List.of(card1, card2));
        
        CardDTO dto1 = new CardDTO();
        CardDTO dto2 = new CardDTO();
        when(cardMapper.toDto(card1)).thenReturn(dto1);
        when(cardMapper.toDto(card2)).thenReturn(dto2);

        List<CardDTO> result = cardService.getCardsByListId(listId);
        assertEquals(2, result.size());
    }

    @Test
    void createCard_shouldSaveAndReturnDto() {
        when(authService.getCurrentUserId()).thenReturn(1L);
        
        CardDTO cardDto = createTestCard(null, "Test Card", "Description", 1L);
        User user = createTestUser(1L, "testuser", "test@email.com", "password");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        ListEntity list = new ListEntity();
        list.setId(1L);

        Board board = new Board();
        board.setId(1L);
        board.setName("Test Board");
        board.setMembers(new ArrayList<>());
        list.setBoard(board);

        when(listRepository.findById(1L)).thenReturn(Optional.of(list));
        when(cardRepository.save(any())).thenAnswer(invocation -> {
            Card card = invocation.getArgument(0);
            card.setId(1L);
            return card;
        });
        
        CardDTO mockDto = new CardDTO();
        when(cardMapper.toDto(any())).thenReturn(mockDto);

        assertDoesNotThrow(() -> cardService.createCard(cardDto, 1L));
        verify(cardRepository).save(any());
    }

    @Test
    void deleteCard_shouldDeleteIfExists() {
        when(authService.getCurrentUserId()).thenReturn(1L);
        
        User user = createTestUser(1L, "testuser", "test@email.com", "password");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        Card card = new Card();
        card.setId(10L);
        card.setTitle("Test Card");

        ListEntity list = new ListEntity();
        Board board = new Board();
        board.setMembers(new ArrayList<>());
        list.setBoard(board);
        card.setList(list);

        when(cardRepository.findById(10L)).thenReturn(Optional.of(card));

        assertDoesNotThrow(() -> cardService.deleteCard(10L));
        verify(cardRepository).deleteById(10L);
    }

    private User createTestUser(Long id, String username, String email, String password) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);
        return user;
    }
    
    private CardDTO createTestCard(Long id, String title, String description, Long listId) {
        CardDTO card = new CardDTO();
        card.setId(id);
        card.setTitle(title);
        card.setDescription(description);
        card.setListId(listId);
        return card;
    }
}
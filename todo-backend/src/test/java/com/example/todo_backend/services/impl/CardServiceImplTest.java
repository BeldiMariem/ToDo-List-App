package com.example.todo_backend.services.impl;

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

import com.example.todo_backend.dtos.CardDTO;
import com.example.todo_backend.entities.Card;
import com.example.todo_backend.entities.ListEntity;
import com.example.todo_backend.exceptions.ResourceNotFoundException;
import com.example.todo_backend.mappers.CardMapper;
import com.example.todo_backend.repositories.CardRepository;
import com.example.todo_backend.repositories.ListEntityRepository;

public class CardServiceImplTest {

    @Mock
    private CardRepository cardRepository;

    @Mock
    private ListEntityRepository listRepository;

    @Mock
    private CardMapper cardMapper;

    @InjectMocks
    private CardServiceImpl cardService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createCard_shouldSaveAndReturnDto() {
        ListEntity list = new ListEntity();
        list.setId(1L);

        CardDTO cardDTO = new CardDTO();
        cardDTO.setTitle("New Card");
        cardDTO.setDescription("Description");
        cardDTO.setListId(1L);

        Card cardToSave = new Card();
        cardToSave.setTitle(cardDTO.getTitle());
        cardToSave.setDescription(cardDTO.getDescription());
        cardToSave.setList(list);

        Card savedCard = new Card();
        savedCard.setId(10L);
        savedCard.setTitle("New Card");
        savedCard.setDescription("Description");
        savedCard.setList(list);

        CardDTO savedDto = new CardDTO();
        savedDto.setId(10L);
        savedDto.setTitle("New Card");
        savedDto.setDescription("Description");
        savedDto.setListId(1L);

        when(listRepository.findById(1L)).thenReturn(Optional.of(list));
        when(cardRepository.save(any(Card.class))).thenReturn(savedCard);
        when(cardMapper.toDto(savedCard)).thenReturn(savedDto);

        CardDTO result = cardService.createCard(cardDTO);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals("New Card", result.getTitle());
        verify(cardRepository).save(any(Card.class));
    }

    @Test
    void updateCard_shouldUpdateAndReturnDto() {
        ListEntity oldList = new ListEntity();
        oldList.setId(1L);

        ListEntity newList = new ListEntity();
        newList.setId(2L);

        Card existingCard = new Card();
        existingCard.setId(5L);
        existingCard.setTitle("Old Title");
        existingCard.setDescription("Old Description");
        existingCard.setList(oldList);

        CardDTO updateDto = new CardDTO();
        updateDto.setTitle("Updated Title");
        updateDto.setDescription("Updated Description");
        updateDto.setListId(2L);

        Card updatedCard = new Card();
        updatedCard.setId(5L);
        updatedCard.setTitle("Updated Title");
        updatedCard.setDescription("Updated Description");
        updatedCard.setList(newList);

        CardDTO updatedDto = new CardDTO();
        updatedDto.setId(5L);
        updatedDto.setTitle("Updated Title");
        updatedDto.setDescription("Updated Description");
        updatedDto.setListId(2L);

        when(cardRepository.findById(5L)).thenReturn(Optional.of(existingCard));
        when(listRepository.findById(2L)).thenReturn(Optional.of(newList));
        when(cardRepository.save(existingCard)).thenReturn(updatedCard);
        when(cardMapper.toDto(updatedCard)).thenReturn(updatedDto);

        CardDTO result = cardService.updateCard(5L, updateDto);

        assertNotNull(result);
        assertEquals("Updated Title", result.getTitle());
        assertEquals(2L, result.getListId());
        verify(cardRepository).save(existingCard);
    }

    @Test
    void getCardsByListId_shouldReturnListOfDtos() {
        ListEntity list = new ListEntity();
        list.setId(1L);

        Card card1 = new Card();
        card1.setId(1L);
        card1.setList(list);

        Card card2 = new Card();
        card2.setId(2L);
        card2.setList(list);

        CardDTO dto1 = new CardDTO();
        dto1.setId(1L);

        CardDTO dto2 = new CardDTO();
        dto2.setId(2L);

        when(cardRepository.findAll()).thenReturn(Arrays.asList(card1, card2));
        when(cardMapper.toDto(card1)).thenReturn(dto1);
        when(cardMapper.toDto(card2)).thenReturn(dto2);

        List<CardDTO> results = cardService.getCardsByListId(1L);

        assertEquals(2, results.size());
        assertTrue(results.contains(dto1));
        assertTrue(results.contains(dto2));
    }

    @Test
    void deleteCard_shouldDeleteIfExists() {
        when(cardRepository.existsById(10L)).thenReturn(true);

        cardService.deleteCard(10L);

        verify(cardRepository).deleteById(10L);
    }

    @Test
    void deleteCard_shouldThrowIfNotFound() {
        when(cardRepository.existsById(999L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> cardService.deleteCard(999L));
    }
}

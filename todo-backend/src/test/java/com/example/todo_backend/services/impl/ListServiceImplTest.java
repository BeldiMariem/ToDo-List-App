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
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

import com.example.todo_backend.dtos.ListDTO;
import com.example.todo_backend.entities.Board;
import com.example.todo_backend.entities.ListEntity;
import com.example.todo_backend.exceptions.ResourceNotFoundException;
import com.example.todo_backend.mappers.ListMapper;
import com.example.todo_backend.repositories.BoardRepository;
import com.example.todo_backend.repositories.ListEntityRepository;

public class ListServiceImplTest {

    @Mock
    private ListEntityRepository listRepository;

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private ListMapper listMapper;

    @InjectMocks
    private ListServiceImpl listService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createList_shouldCreateListSuccessfully() {
        ListDTO listDTO = new ListDTO(null, "To Do", "#FF0000", 1L, null);
        Board board = new Board();
        board.setId(1L);

        ListEntity listEntity = new ListEntity(null, "To Do", "#FF0000", board, null);
        ListEntity savedList = new ListEntity(1L, "To Do", "#FF0000", board, null);
        ListDTO expectedDto = new ListDTO(1L, "To Do", "#FF0000", 1L, null);

        when(boardRepository.findById(1L)).thenReturn(Optional.of(board));
        when(listRepository.save(any(ListEntity.class))).thenReturn(savedList);
        when(listMapper.toDto(savedList)).thenReturn(expectedDto);

        ListDTO result = listService.createList(listDTO);

        assertNotNull(result);
        assertEquals(expectedDto.getName(), result.getName());
        assertEquals(expectedDto.getColor(), result.getColor());
        assertEquals(expectedDto.getBoardId(), result.getBoardId());
    }

    @Test
    void getListsByBoardId_shouldReturnListsForBoard() {

        Board board = new Board();
        board.setId(1L);

        ListEntity list1 = new ListEntity(1L, "List 1", "#FFF", board, null);
        ListEntity list2 = new ListEntity(2L, "List 2", "#000", board, null);

        ListDTO dto1 = new ListDTO(1L, "List 1", "#FFF", 1L, null);
        ListDTO dto2 = new ListDTO(2L, "List 2", "#000", 1L, null);

        when(listRepository.findAll()).thenReturn(Arrays.asList(list1, list2));
        when(listMapper.toDto(list1)).thenReturn(dto1);
        when(listMapper.toDto(list2)).thenReturn(dto2);

        List<ListDTO> result = listService.getListsByBoardId(1L);

        assertEquals(2, result.size());
        assertTrue(result.contains(dto1));
        assertTrue(result.contains(dto2));
    }

    @Test
    void deleteList_shouldDeleteExistingList() {
        Board board = new Board();
        board.setId(1L);
        ListEntity list = new ListEntity(1L, "Done", "#000", board, null);

        when(listRepository.findById(1L)).thenReturn(Optional.of(list));

        listService.deleteList(1L);

        verify(listRepository, times(1)).delete(list);
    }

    @Test
    void deleteList_shouldThrowIfListNotFound() {
        when(listRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> listService.deleteList(999L));
    }
}

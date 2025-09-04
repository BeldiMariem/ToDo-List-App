package com.example.todo_backend.controllers;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.example.todo_backend.dtos.ListDTO;
import com.example.todo_backend.services.ListService;
import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class ListControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ListService listService;

    @InjectMocks
    private ListController listController;

    private ObjectMapper objectMapper = new ObjectMapper();
    private ListDTO testListDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(listController).build();

        testListDTO = new ListDTO();
        testListDTO.setId(1L);
        testListDTO.setName("Test List");
        testListDTO.setColor("blue");
        testListDTO.setBoardId(1L);
    }

    @Test
    void createList_shouldReturnCreatedList() throws Exception {
        when(listService.createList(any(ListDTO.class))).thenReturn(testListDTO);

        mockMvc.perform(post("/api/lists/createList")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testListDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Test List"))
                .andExpect(jsonPath("$.color").value("blue"))
                .andExpect(jsonPath("$.boardId").value(1L));

        verify(listService).createList(any(ListDTO.class));
    }

    @Test
    void updateList_shouldReturnUpdatedList() throws Exception {
        when(listService.updateList(any(ListDTO.class))).thenReturn(testListDTO);

        mockMvc.perform(put("/api/lists/updateList")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testListDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Test List"));

        verify(listService).updateList(any(ListDTO.class));
    }

    @Test
    void getListsByBoard_shouldReturnListOfListDTOs() throws Exception {
        Long boardId = 1L;
        List<ListDTO> lists = List.of(testListDTO);
        when(listService.getListsByBoardId(boardId)).thenReturn(lists);

        mockMvc.perform(get("/api/lists/getListsByBoard/{boardId}", boardId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].name").value("Test List"))
                .andExpect(jsonPath("$[0].color").value("blue"))
                .andExpect(jsonPath("$[0].boardId").value(1L));

        verify(listService).getListsByBoardId(boardId);
    }

    @Test
    void deleteList_shouldReturnNoContent() throws Exception {
        Long listId = 1L;
        doNothing().when(listService).deleteList(listId);

        mockMvc.perform(delete("/api/lists/deleteList/{id}", listId))
                .andExpect(status().isNoContent());

        verify(listService).deleteList(listId);
    }

    @Test
    void createList_shouldHandleServiceException() throws Exception {
        when(listService.createList(any(ListDTO.class)))
                .thenThrow(new RuntimeException("Service error"));

        mockMvc.perform(post("/api/lists/createList")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testListDTO)))
                .andExpect(status().isInternalServerError());

        verify(listService).createList(any(ListDTO.class));
    }

    @Test
    void getListsByBoard_shouldHandleEmptyList() throws Exception {
        Long boardId = 999L;
        when(listService.getListsByBoardId(boardId)).thenReturn(List.of());

        mockMvc.perform(get("/api/lists/getListsByBoard/{boardId}", boardId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());

        verify(listService).getListsByBoardId(boardId);
    }

    @Test
    void deleteList_shouldHandleNotFound() throws Exception {
        Long listId = 999L;
        doThrow(new RuntimeException("List not found"))
                .when(listService).deleteList(listId);

        mockMvc.perform(delete("/api/lists/deleteList/{id}", listId))
                .andExpect(status().isNotFound()); 
        verify(listService).deleteList(listId);
    }
}

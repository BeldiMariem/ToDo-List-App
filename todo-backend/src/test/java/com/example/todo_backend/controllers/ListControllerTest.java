package com.example.todo_backend.controllers;

import static org.hamcrest.Matchers.hasSize;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.todo_backend.dtos.ListDTO;
import com.example.todo_backend.entities.Board;
import com.example.todo_backend.entities.ListEntity;
import com.example.todo_backend.repositories.BoardRepository;
import com.example.todo_backend.repositories.ListEntityRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser(username = "mariem") 
public class ListControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private ListEntityRepository listRepository;

    private Long boardId;

    @BeforeEach
    public void setup() {
        listRepository.deleteAll();
        boardRepository.deleteAll();

        Board board = new Board();
        board.setName("Test Board");
        boardRepository.save(board);
        boardId = board.getId();
    }

    @Test
    public void testCreateList() throws Exception {
        ListDTO listDTO = new ListDTO();
        listDTO.setName("Todo");
        listDTO.setColor("blue");
        listDTO.setBoardId(boardId);

        mockMvc.perform(post("/api/lists/createList")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(listDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Todo"))
                .andExpect(jsonPath("$.color").value("blue"))
                .andExpect(jsonPath("$.boardId").value(boardId));
    }

    @Test
    public void testGetListsByBoard() throws Exception {
        ListEntity list = new ListEntity();
        list.setName("Doing");
        list.setColor("green");
        list.setBoard(boardRepository.findById(boardId).get());
        listRepository.save(list);

        mockMvc.perform(get("/api/lists/getListsByBoard/" + boardId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Doing"));
    }

    @Test
    public void testDeleteList() throws Exception {
        ListEntity list = new ListEntity();
        list.setName("ToDelete");
        list.setColor("red");
        list.setBoard(boardRepository.findById(boardId).get());
        listRepository.save(list);

        mockMvc.perform(delete("/api/lists/deleteList/" + list.getId()))
                .andExpect(status().isNoContent());
    }
}

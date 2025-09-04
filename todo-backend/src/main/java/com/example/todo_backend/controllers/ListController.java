package com.example.todo_backend.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.todo_backend.dtos.ListDTO;
import com.example.todo_backend.services.ListService;

import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/lists")
@RequiredArgsConstructor
public class ListController {

    private final ListService listService;

    @PostMapping("/createList")
    public ResponseEntity<ListDTO> createList(@RequestBody ListDTO listDTO) {
        ListDTO createdList = listService.createList(listDTO);
        return ResponseEntity.status(201).body(createdList);
    }

    @PutMapping("/updateList")
    public ResponseEntity<ListDTO> updateList(@RequestBody ListDTO listDTO) {
        ListDTO createdList = listService.updateList(listDTO);
        return ResponseEntity.status(201).body(createdList);
    }


    @GetMapping("/getListsByBoard/{boardId}")
    public ResponseEntity<List<ListDTO>> getListsByBoard(@PathVariable Long boardId) {
        return ResponseEntity.ok(listService.getListsByBoardId(boardId));
    }

    @DeleteMapping("/deleteList/{id}")
    public ResponseEntity<Void> deleteList(@PathVariable Long id) {
        listService.deleteList(id);
        return ResponseEntity.noContent().build();
    }
    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        if (ex.getMessage().toLowerCase().contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
    }
}

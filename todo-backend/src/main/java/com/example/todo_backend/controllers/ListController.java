package com.example.todo_backend.controllers;

import com.example.todo_backend.dtos.ListDTO;
import com.example.todo_backend.services.ListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lists")
@RequiredArgsConstructor
public class ListController {

    private final ListService listService;

    @PostMapping
    public ResponseEntity<ListDTO> createList(@RequestBody ListDTO dto) {
        return ResponseEntity.status(201).body(listService.createList(dto));
    }

    @GetMapping("/board/{boardId}")
    public ResponseEntity<List<ListDTO>> getListsByBoard(@PathVariable Long boardId) {
        return ResponseEntity.ok(listService.getListsByBoardId(boardId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteList(@PathVariable Long id) {
        listService.deleteList(id);
        return ResponseEntity.noContent().build();
    }
}

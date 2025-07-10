package com.example.todo_backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.todo_backend.dtos.BoardDTO;
import com.example.todo_backend.dtos.BoardUpdateDTO;
import com.example.todo_backend.services.AuthService;
import com.example.todo_backend.services.BoardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final AuthService authenticationService;

    private final BoardService boardService;

    @PostMapping("/createBoard")
    public ResponseEntity<BoardDTO> createBoard(@RequestBody BoardDTO boardDTO) {
        Long userId = authenticationService.getCurrentUserId();
        return ResponseEntity.ok(boardService.createBoard(boardDTO, userId));
    }

    @PutMapping("/updateBoard")
    public ResponseEntity<BoardDTO> updateBoard(
        @RequestBody BoardUpdateDTO updateDTO) {
        Long userId = authenticationService.getCurrentUserId();
        return ResponseEntity.ok(boardService.updateBoard(updateDTO, userId));
    }

    @GetMapping("/getBoard/{id}")
    public ResponseEntity<BoardDTO> getBoardById(@PathVariable Long id) {
        return ResponseEntity.ok(boardService.getBoardById(id));
    }

    @DeleteMapping("/deleteBoard/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id) {
        boardService.deleteBoard(id);
        return ResponseEntity.noContent().build();
    }
}

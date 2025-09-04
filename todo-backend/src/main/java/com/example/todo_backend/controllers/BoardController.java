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
        System.out.println("Creating board for user ID: " + userId);

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

    @GetMapping("/getBoardByUser")
    public ResponseEntity<List<BoardDTO>> getBoardsByUserId() {
        Long userId = authenticationService.getCurrentUserId();
        return ResponseEntity.ok(boardService.getBoardsByUserId(userId));
    }

    @DeleteMapping("/deleteBoard/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id) {
        boardService.deleteBoard(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        if (ex.getMessage().contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
    }
}

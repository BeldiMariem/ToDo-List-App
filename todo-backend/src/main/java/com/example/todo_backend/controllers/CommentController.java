package com.example.todo_backend.controllers;

import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.todo_backend.dtos.CommentDTO;
import com.example.todo_backend.services.CommentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/comments") 
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/createComment") 
    public ResponseEntity<CommentDTO> createComment(@RequestBody CommentDTO commentDTO, Principal principal) {
        String username = principal.getName();
        CommentDTO createdComment = commentService.createComment(commentDTO, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
    }

    @GetMapping("/getCommentsByCard/{cardId}") 
    public ResponseEntity<List<CommentDTO>> getCommentsByCard(@PathVariable Long cardId) {
        List<CommentDTO> comments = commentService.getCommentsByCardId(cardId);
        return ResponseEntity.ok(comments);
    }

    @DeleteMapping("/deleteComment/{id}") 
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
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
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

import com.example.todo_backend.dtos.CardDTO;
import com.example.todo_backend.services.AuthService;
import com.example.todo_backend.services.CardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;
    private final AuthService authenticationService;

    @PostMapping("/createCard")
    public ResponseEntity<CardDTO> createCard(@RequestBody CardDTO cardDTO) {
        Long userId = authenticationService.getCurrentUserId();

        CardDTO createdCard = cardService.createCard(cardDTO,userId);
        return ResponseEntity.status(201).body(createdCard);
    }

    @PutMapping("/updateCard/{cardId}")
    public ResponseEntity<CardDTO> updateCard(@PathVariable Long cardId, @RequestBody CardDTO cardDTO) {
        CardDTO updatedCard = cardService.updateCard(cardId, cardDTO);
        return ResponseEntity.ok(updatedCard);
    }

    @GetMapping("/getCardsByList/{listId}")
    public ResponseEntity<List<CardDTO>> getCardsByList(@PathVariable Long listId) {
        return ResponseEntity.ok(cardService.getCardsByListId(listId));
    }

    @DeleteMapping("/deleteCard/{id}")
    public ResponseEntity<Void> deleteCard(@PathVariable Long id) {
        cardService.deleteCard(id);
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

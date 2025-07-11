package com.example.todo_backend.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.todo_backend.dtos.CardDTO;
import com.example.todo_backend.services.CardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    @PostMapping("/createCard")
    public ResponseEntity<CardDTO> createCard(@RequestBody CardDTO cardDTO) {
        CardDTO createdCard = cardService.createCard(cardDTO);
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
}

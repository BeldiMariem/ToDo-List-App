package com.example.todo_backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.todo_backend.entities.Card;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByListId(Long listId);
}


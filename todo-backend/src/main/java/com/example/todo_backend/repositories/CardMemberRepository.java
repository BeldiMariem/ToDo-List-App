package com.example.todo_backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.todo_backend.entities.CardMember;

@Repository
public interface CardMemberRepository extends JpaRepository<CardMember, Long> {}

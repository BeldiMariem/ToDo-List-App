package com.example.todo_backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.todo_backend.entities.BoardMember;

@Repository
public interface BoardMemberRepository extends JpaRepository<BoardMember, Long> {}

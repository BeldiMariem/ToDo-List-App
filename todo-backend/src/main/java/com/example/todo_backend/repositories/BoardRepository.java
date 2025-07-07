package com.example.todo_backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.todo_backend.entities.Board;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {
     List<Board> findByMembers_User_Id(Long userId);
}
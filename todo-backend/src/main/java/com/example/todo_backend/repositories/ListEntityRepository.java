package com.example.todo_backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.todo_backend.entities.ListEntity;

@Repository
public interface ListEntityRepository extends JpaRepository<ListEntity, Long> {

    List<ListEntity> findByBoard_Id(Long boardId);

}

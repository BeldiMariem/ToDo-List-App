package com.example.todo_backend.dtos;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListDTO {
    private Long id;
    private String name;
    private String color;
    private Long boardId;
    private List<CardDTO> cards;
}

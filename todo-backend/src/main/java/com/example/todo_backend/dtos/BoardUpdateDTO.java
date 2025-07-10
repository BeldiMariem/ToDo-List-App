package com.example.todo_backend.dtos;

import java.util.List;

import lombok.Data;
@Data
public class BoardUpdateDTO {
    private Long boardId;
    private String newName;
    private List<Long> userIds; 
    private String role; 
    
}

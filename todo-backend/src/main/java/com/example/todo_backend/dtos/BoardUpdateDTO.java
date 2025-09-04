package com.example.todo_backend.dtos;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardUpdateDTO {
    private Long boardId;
    private String newName;
    private List<Long> userIds; 
    private String role; 
    
}

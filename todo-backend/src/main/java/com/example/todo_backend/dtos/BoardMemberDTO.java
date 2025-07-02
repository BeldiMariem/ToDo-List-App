package com.example.todo_backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardMemberDTO {
    private Long id;
    private UserDTO user;
    private Long boardId; // To avoid deep recursion
    private String role;
}

package com.example.todo_backend.dtos;


import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardMemberDTO {
    private Long id;
    private Long userId;
    private Long boardId;
    private String role;
}
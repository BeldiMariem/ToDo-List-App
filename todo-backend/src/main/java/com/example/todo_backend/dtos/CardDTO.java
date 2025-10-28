package com.example.todo_backend.dtos;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardDTO {
    private Long id;
    private String title;
    private String tag;
    private String description;
    private Long listId;
    private List<CardMemberDTO> members;
    private List<CommentDTO> comments;
}

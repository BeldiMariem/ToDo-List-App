package com.example.todo_backend.dtos;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class BoardDetailDTO {
    private Long id;
    private String name;
    private List<BoardMemberDTO> members = new ArrayList<>(); 
    private List<ListDTO> lists = new ArrayList<>(); 
}
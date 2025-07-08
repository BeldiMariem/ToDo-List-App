package com.example.todo_backend.dtos;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardDTO {
    private Long id;
    private String name;
    private List<BoardMemberDTO> members;
    private List<ListDTO> lists;
}

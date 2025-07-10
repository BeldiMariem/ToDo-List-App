package com.example.todo_backend.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.todo_backend.dtos.BoardDTO;
import com.example.todo_backend.dtos.BoardUpdateDTO;
import com.example.todo_backend.entities.Board;
import com.example.todo_backend.entities.BoardMember;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.exceptions.ResourceNotFoundException;
import com.example.todo_backend.mappers.BoardMapper;
import com.example.todo_backend.repositories.BoardRepository;
import com.example.todo_backend.repositories.UserRepository;
import com.example.todo_backend.services.BoardService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {

    private final BoardRepository boardRepository;
    private final BoardMapper boardMapper;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public BoardDTO createBoard(BoardDTO dto, Long userId) {
        Board board = new Board();
        board.setName(dto.getName());

        Board savedBoard = boardRepository.save(board);

        User user = findUserById(userId);
        addBoardMember(savedBoard, user, "ADMIN");

        return boardMapper.toSimpleDto(savedBoard);
    }

    @Override
    public List<BoardDTO> getBoardsByUserId(Long userId) {
        return boardRepository.findByMembers_User_Id(userId).stream()
                .map(boardMapper::toSimpleDto)
                .collect(Collectors.toList());
    }

    @Override
    public BoardDTO getBoardById(Long id) {
        return boardRepository.findById(id)
                .map(boardMapper::toSimpleDto)
                .orElseThrow(() -> new ResourceNotFoundException("Board", "id", id));
    }

    @Override
    public void deleteBoard(Long id) {
        if (!boardRepository.existsById(id)) {
            throw new ResourceNotFoundException("Board", "id", id);
        }
        boardRepository.deleteById(id);
    }

    @Override
    @Transactional
    public BoardDTO updateBoard(BoardUpdateDTO updateDTO, Long currentUserId) {
        Board board = findBoardById(updateDTO.getBoardId());

        if (!hasPermission(board, currentUserId)) {
            throw new IllegalStateException("You do not have permission to modify this board");
        }

        updateBoardNameIfPresent(board, updateDTO.getNewName());

        if (updateDTO.getUserIds() != null && !updateDTO.getUserIds().isEmpty()) {
            updateBoardMembers(board, updateDTO.getUserIds(), updateDTO.getRole());
        }

        return boardMapper.toSimpleDto(boardRepository.save(board));
    }


    private Board findBoardById(Long boardId) {
        return boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board", "id", boardId));
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    private boolean hasPermission(Board board, Long userId) {
        return board.getMembers().stream()
                .anyMatch(member ->
                        member.getUser().getId().equals(userId) &&
                        ("ADMIN".equalsIgnoreCase(member.getRole()) || "OWNER".equalsIgnoreCase(member.getRole()))
                );
    }

    private void updateBoardNameIfPresent(Board board, String newName) {
        if (newName != null && !newName.trim().isEmpty()) {
            board.setName(newName);
        }
    }

    private void updateBoardMembers(Board board, List<Long> userIds, String role) {
        for (Long userId : userIds) {
            User user = findUserById(userId);
            addOrUpdateBoardMember(board, user, role);
        }
    }

    private void addOrUpdateBoardMember(Board board, User user, String role) {
        board.getMembers().stream()
                .filter(member -> member.getUser().getId().equals(user.getId()))
                .findFirst()
                .ifPresentOrElse(
                        member -> {
                            if (role != null && !role.trim().isEmpty()) {
                                member.setRole(role);
                            }
                        },
                        () -> addBoardMember(board, user, role)
                );
    }

    private void addBoardMember(Board board, User user, String role) {
        BoardMember member = new BoardMember();
        member.setBoard(board);
        member.setUser(user);
        member.setRole(role != null && !role.trim().isEmpty() ? role : "MEMBER");
        board.getMembers().add(member);
    }
}

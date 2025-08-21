import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // ⬅️ import CommonModule
import { BoardService } from '../../../core/services/board.service';
import { BoardDTO } from '../../../core/models/board.model';

@Component({
  selector: 'app-boards-page',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './board-manegement.component.html',
  styleUrls: ['./board-manegement.component.scss']
})
export class BoardManegementComponent implements OnInit {
  boards: BoardDTO[] = [];
  loading = false;
  error: string | null = null;

  constructor(public boardService: BoardService, private router: Router) {}

  ngOnInit(): void {
    this.boards = this.boardService.boards(); 
    this.loading = this.boardService.loading();
    this.error = this.boardService.error();
    this.boardService.getBoards();
  }

  openBoard(boardId: number): void {
    this.router.navigate(['/boards', boardId]);
  }

  createBoard(): void {
  }
}

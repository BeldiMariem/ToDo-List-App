import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListService } from '../../../core/services/list.service';
import { ListDTO } from '../../../core/models/list.model';

@Component({
  selector: 'app-board-detail',
  templateUrl: './board-detail.component.html',
  styleUrls: ['./board-detail.component.scss']
})
export class BoardDetailComponent implements OnInit {
  boardId!: number;
  lists: ListDTO[] = [];

  constructor(private route: ActivatedRoute, private listService: ListService) {}

  ngOnInit(): void {
    this.boardId = +this.route.snapshot.paramMap.get('id')!;
    this.loadLists();
  }

  loadLists(): void {
    this.listService.getLists(this.boardId).subscribe((data) => (this.lists = data));
  }
}

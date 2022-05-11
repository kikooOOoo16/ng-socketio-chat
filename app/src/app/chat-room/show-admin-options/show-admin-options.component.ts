import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SocketService} from "../../services/socket.service";

@Component({
  selector: 'app-show-admin-options',
  templateUrl: './show-admin-options.component.html',
  styleUrls: ['./show-admin-options.component.css']
})
export class ShowAdminOptionsComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Input() userName!: string;
  @Input() roomName!: string;
  @Input() userId!:string;

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
  }

  onClose = () => {
    this.close.emit();
  }

  onKickUser = () => {
    // send kickUser event
    this.socketService.kickUserFromRoom(this.roomName, this.userId);
    // close modal component
    this.onClose();
  }

  onBanUser = () => {

  }
}

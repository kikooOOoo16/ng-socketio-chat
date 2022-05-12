import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SocketMessage} from "../../interfaces/socketMessage";
import {SocketService} from "../../services/socket.service";

@Component({
  selector: 'app-edit-chat-message',
  templateUrl: './edit-chat-message.component.html',
  styleUrls: ['./edit-chat-message.component.css']
})
export class EditChatMessageComponent implements OnInit {
  @Input() message!: SocketMessage;
  @Input() roomName!: string;
  @Output() close = new EventEmitter<void>();

  editedMessage: string = '';

  onClose = () => {
    this.close.emit();
  }
  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    this.editedMessage = this.message.text;
  }

  onEdit = (editMessageValue: string) => {
    // create new editedMessage object in an immutable way
    const editedMessage: SocketMessage = {
      ...this.message,
      text: editMessageValue
    }
    // send edit message socketIO event
    this.socketService.editMessage(this.roomName, editedMessage);
    this.close.emit();
  }
}

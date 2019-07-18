import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { DataParserService } from '../service/data-parser.service';

@Component({
  selector: 'app-detail-node',
  templateUrl: './detail-node.component.html',
  styleUrls: ['./detail-node.component.css']
})
export class DetailNodeComponent implements OnInit {

  @Input() node : any;
  @Output() unselect = new EventEmitter<boolean>(); // enables to unselect object when pressing close
  info : any;

  constructor(private dataParserService : DataParserService) { }

  ngOnInit() {
  }

  ngOnChanges(){
    this.initialiseInfo();
  }

  close(){
    this.unselect.emit(true);
  }

  initialiseInfo(){
    this.info = this.dataParserService.getInfo(this.node);
  }
}

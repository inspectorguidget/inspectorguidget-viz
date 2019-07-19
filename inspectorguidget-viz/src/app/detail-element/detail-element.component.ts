import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { DataParserService } from '../service/data-parser.service';

@Component({
  selector: 'app-detail-element',
  templateUrl: './detail-element.component.html',
  styleUrls: ['./detail-element.component.css']
})
export class DetailElementComponent implements OnInit {

  @Input() element : any;
  @Input() elementType : any;
  @Output() unselect = new EventEmitter<boolean>(); // enables to unselect object when pressing close
  info : any;

  constructor(private dataParserService : DataParserService) { }

  ngOnInit() {
  }

  ngOnChanges(){
    
    if(this.elementType === "cluster"){
      this.initialiseCluster();
    }
    else{
      this.initialiseNode();
    }
  }

  close(){
    this.unselect.emit(true);
  }

  initialiseNode(){
    this.info = this.dataParserService.getNodeInfo(this.element);
  }

  initialiseCluster(){
    this.info = this.dataParserService.getClusterInfo(this.element);
  }
}

/*
 * This file is part of InspectorGuidget.
 * InspectorGuidget is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * InspectorGuidget is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with InspectorGuidget.  If not, see <https://www.gnu.org/licenses/>.
 */

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

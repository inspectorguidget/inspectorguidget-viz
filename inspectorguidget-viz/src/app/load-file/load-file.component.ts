import { Component, OnInit } from '@angular/core';
import { DataParserService } from '../service/data-parser.service';

@Component({
  selector: 'app-load-file',
  templateUrl: './load-file.component.html',
  styleUrls: ['./load-file.component.css']
})
export class LoadFileComponent implements OnInit {

  files: File[] = [];

  constructor(private dataParserService : DataParserService) { }

  ngOnInit() {
  }

  uploadFile(event) {
    for (let index = 0; index < event.length; index++) {
      const element = event[index];
      this.files.push(element)
    }  
  }

  deleteAttachment(index) {
    this.files.splice(index, 1) //remove 1 file from index in
  }

  startVis(file : File){
    this.dataParserService.parseFile(file);
  }

}

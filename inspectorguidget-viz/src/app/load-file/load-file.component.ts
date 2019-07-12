import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-load-file',
  templateUrl: './load-file.component.html',
  styleUrls: ['./load-file.component.css']
})
export class LoadFileComponent implements OnInit {

  files: any = [];

  constructor() { }

  ngOnInit() {
  }

  viz(){
    console.log("changement de page")
  }

  uploadFile(event) {
    for (let index = 0; index < event.length; index++) {
      const element = event[index];
      this.files.push(element.name)
    }  
  }

  deleteAttachment(index) {
    this.files.splice(index, 1) //remove 1 file from index in
  }

}

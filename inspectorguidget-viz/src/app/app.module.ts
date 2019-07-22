import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { VisualisationComponent } from './visualisation/visualisation.component';
import { LoadFileComponent } from './load-file/load-file.component';
import { DragDropDirective } from './directives/drag-drop.directive';
import { GraphComponent } from './graph/graph.component';
import { DetailElementComponent } from './detail-element/detail-element.component';
import { LoadFileDialogComponent } from './load-file-dialog/load-file-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    VisualisationComponent,
    LoadFileComponent,
    DragDropDirective,
    GraphComponent,
    DetailElementComponent,
    LoadFileDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { VisualisationComponent } from './visualisation/visualisation.component';
import { AboutProjectComponent } from './about-project/about-project.component';
import { LoadFileComponent } from './load-file/load-file.component';
import { DragDropDirective } from './drag-drop.directive';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    VisualisationComponent,
    AboutProjectComponent,
    LoadFileComponent,
    DragDropDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

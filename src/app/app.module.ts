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

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    VisualisationComponent,
    LoadFileComponent,
    DragDropDirective,
    GraphComponent,
    DetailElementComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

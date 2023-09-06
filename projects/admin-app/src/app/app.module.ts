import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { AdminCoreModule, AdminCoreRoutingModule } from '@tailormap-admin/admin-core';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AdminCoreModule.forRoot({
      production: environment.production,
      viewerBaseUrl: environment.viewerBaseUrl,
    }),
    AdminCoreRoutingModule,
    ...environment.imports,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }

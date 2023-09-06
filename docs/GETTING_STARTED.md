# Getting Started
This document describes the first steps to create a custom component and run it inside Tailormap

### First steps

First we want to create a new Angular component, so we are running the Angular CLI to generate one

```bash
npm run ng -- g c logo-on-map
```

This will create a new component inside the `projects/app/src/app/logo-on-map` directory

Next we want to register this component with Tailormap. To do that we need to use one of the entry points that Tailormap provides (see the Tailormap API docs). Here we are adding something on the map, so we will use the `MapControlsService` to register our component. We will add this in the `app.module.ts`. Add the following code to `app.module.ts` inside the `AppModule` class

```
constructor(
  mapControlsService: MapControlsService,
) {
  mapControlsService.registerComponent(LogoOnMapComponent);
}
```

You will also need to add `MapControlsService` to the `@tailormap-viewer/core` imports

Your file should now look like:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CoreModule, CoreRoutingModule, MapControlsService } from "@tailormap-viewer/core";
import { SharedModule } from "@tailormap-viewer/shared";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { LogoOnMapComponent } from './logo-on-map/logo-on-map.component';

@NgModule({
  declarations: [
    AppComponent,
    LogoOnMapComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    CoreRoutingModule,
    SharedModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    mapControlsService: MapControlsService,
  ) {
    mapControlsService.registerComponent(LogoOnMapComponent);
  }
}
```

Let's add some styling to our component (`logo-on-map.component.css`):

```css
p {
  position: absolute;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 16px;
  white-space: nowrap;
  background-color: darkviolet;
  color: darkgrey;
}
```

Now run the application using `npm run start` and visit `http://localhost:4200` in your browser. If everything went as planned you should see the Tailormap viewer and our new component in the right-bottom corner. 

### Implement your component

With our custom component we want to show a logo on a map. For that we need coordinates for where to place the logo and convert these coordinates to pixels on the screen, so we can place our logo.

Tailormap has some useful mapping APIs and here we will use the `getPixelForCoordinates$` method to convert coordinates to pixels. Since it's an `Observable` stream we get updates once we move the map, so we can update the position of the image accordingly.

Below the source code for our component:

```typescript
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MapService } from "@tailormap-viewer/map";
import { HttpClient } from "@angular/common/http";
import { Observable, map, of, switchMap, concatMap } from "rxjs";
import { default as WKT } from "ol/format/WKT";
import { Geometry, Point } from "ol/geom";
import { Feature } from "ol";

type LocationServerResponseType = { response: { docs: Array<{ centroide_ll: string }> }};

@Component({
  selector: 'app-logo-on-map',
  templateUrl: './logo-on-map.component.html',
  styleUrls: ['./logo-on-map.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoOnMapComponent implements OnInit {

  public imgStyle$: Observable<{ top?: string; left?: string; display: string }> = of({ display: 'none' });

  constructor(
    private mapService: MapService,
    private httpClient: HttpClient,
  ) { }

  public ngOnInit(): void {
    // Lookup the address for B3Partners HQ using the 'PDOK locatieserver'
    const url = 'https://geodata.nationaalgeoregister.nl/locatieserver/v3/free?q=Zonnebaan%2012C,%203542%20EC%20Utrecht&rows=1&fl=id,bron,weergavenaam,type,centroide_rd,centroide_ll&fq=*';
    this.imgStyle$ = this.httpClient.get<LocationServerResponseType>(url)
      .pipe(
        switchMap(result => {
          if (!result.response?.docs || result.response.docs.length === 0) {
            return of(null);
          }
          // Get the current projection we are working in
          return this.mapService.getProjectionCode$()
            .pipe(
              concatMap(projectionCode => {
                if (!projectionCode) {
                  return of(null);
                }
                // Convert the WKT from the service to geometry using Openlayers
                const format = new WKT();
                const feature: Feature<Geometry> = format.readFeature(result.response.docs[0].centroide_ll, {
                  dataProjection: 'EPSG:4326',
                  featureProjection: projectionCode
                });
                // Use as Point geometry since we know it's a point
                const coords = (feature.getGeometry() as Point)?.getCoordinates();
                if (!coords) {
                  return of(null);
                }
                // Get screen pixels for coordinates
                return this.mapService.getPixelForCoordinates$([coords[0], coords[1]]);
              })
            )
        }),
        map(coords => {
          if (!coords) {
            // Oops, no coordinates, hide image
            return { display: 'none' };
          }
          // CSS styling to display the image on the correct position
          return { display: 'inline-block', left: `${coords[0]}px`, top: `${coords[1]}px` };
        })
      );
  }

}
```
CSS (logo-on-map.component.css):
```css
img {
  position: absolute;
  width: 30px;
  height: 30px;
  display: none;
}
```
and template (logo-on-map.component.html)
```angular2html
<img [ngStyle]="imgStyle$ | async"
     role="img"
     src="https://www.b3partners.nl/portal/custom/images/logo-short.png"
     alt="Logo B3Partners" />
```
The code should be pretty self-explanatory if you are familiar with the Angular framework. But basically we use Angulars httpCLient to fetch the location, convert the WKT returned from the service to coordinates using Openlayers and the `getProjectionCode$` method from Tailormap and then convert these coordinates to pixels using `getPixelForCoordinates$`

If we run the application now, we should be able to see the B3Partners logo placed on the right location on the map.

#### Testing

Let's add a simple test to check if our code is working correctly. We are using the Angular Testing Library framework to make testing easier and more readable. Add the following code to `logo-on-map.component.spec.ts`

```typescript
import { render, screen } from '@testing-library/angular';
import { LogoOnMapComponent } from './logo-on-map.component';
import { of } from "rxjs";
import { MapService } from "@tailormap-viewer/map";
import { HttpClient } from "@angular/common/http";

describe('LogoOnMapComponent', () => {

  test('should render', async () => {
    const httpClient = {
      get: jest.fn(() => of({
        response: {
          docs: [
            { centroide_ll: 'POINT(5.04185307 52.11887446)' },
          ],
        },
      })),
    };
    const mapService = {
      getProjectionCode$: jest.fn(() => of('EPSG:28992')),
      getPixelForCoordinates$: jest.fn(() => of([ 5, 5 ])),
    }
    await render(LogoOnMapComponent, {
      providers: [
        { provide: MapService, useValue: mapService },
        { provide: HttpClient, useValue: httpClient },
      ]
    });
    const img = await screen.getByAltText('Logo B3Partners');
    expect((img as HTMLElement).style.left).toEqual('5px');
    expect((img as HTMLElement).style.top).toEqual('5px');
  });

});
```
Running the tests `npm run test` should give us all green results.

import { render } from '@testing-library/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  test('should create the app', async () => {
    const { fixture } = await render(AppComponent, {
      imports: [RouterTestingModule],
    });
    expect(fixture);
  });
});

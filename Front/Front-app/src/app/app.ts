import { Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
    token: string | null = null;

  constructor(private api: ApiService) {}

  async doLogin() {
    const res: any = await this.api.login('user', 'pass');
    this.token = res.token;
  }

  async loadQueue() {
    if (!this.token) return;
    const data = await this.api.getQueue(this.token);
    console.log(data);
  }

}
